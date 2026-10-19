import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Channel, EPGProgram } from '../../types';
import { getChannelSchedule, getCurrentAndNextProgram } from '../../data/programs';
import { loadEpg, refreshEpg, EpgLoadResult } from './epgService';
import { normalizeChannelId } from './xmltv';

type EpgStatus = 'loading' | 'ready' | 'empty' | 'error';

interface ProgramInfo {
  currentProgram: EPGProgram;
  nextProgram: EPGProgram;
  progressPercent: number;
  formattedTime: string;
  fullSchedule: EPGProgram[];
}

interface EpgContextValue {
  status: EpgStatus;
  lastUpdated: number | null;
  sourceUrl: string | null;
  fromCache: boolean;
  stale: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getPrograms: (channel: Channel) => EPGProgram[];
  getNowNext: (channel: Channel) => ProgramInfo;
  hasRealEpg: (channel: Channel) => boolean;
}

const EpgContext = createContext<EpgContextValue | undefined>(undefined);

function formatTime(ms: number): string {
  const date = new Date(ms);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function channelKeys(channel: Channel): string[] {
  const keys = new Set<string>();
  [channel.epgId, channel.tvgId, channel.id].forEach((value) => {
    const normalized = normalizeChannelId(value);
    if (normalized) keys.add(normalized);
  });
  if (channel.id.startsWith('lusofonia-')) {
    keys.add(normalizeChannelId(channel.id.replace('lusofonia-', '')));
  }
  return [...keys];
}

function toEpgPrograms(
  channel: Channel,
  programmes: { startMs: number; stopMs: number; title: string; description: string; category: string }[],
  now: number
): EPGProgram[] {
  return programmes.map((programme, index) => {
    const isLive = now >= programme.startMs && now < programme.stopMs;
    const duration = Math.max(1, programme.stopMs - programme.startMs);
    const elapsed = Math.min(duration, Math.max(0, now - programme.startMs));
    return {
      id: `xmltv-${channel.id}-${programme.startMs}-${index}`,
      channelId: channel.id,
      title: programme.title,
      description: programme.description,
      startTime: formatTime(programme.startMs),
      endTime: formatTime(programme.stopMs),
      category: programme.category,
      isLive,
      progressPercent: isLive ? Math.round((elapsed / duration) * 100) : 0,
      startMs: programme.startMs,
      endMs: programme.stopMs,
      source: 'xmltv',
    };
  });
}

function fallbackNowNext(channel: Channel): ProgramInfo {
  const info = getCurrentAndNextProgram(channel);
  const now = new Date();
  return {
    ...info,
    formattedTime: `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`,
    currentProgram: { ...info.currentProgram, source: 'estimated' },
    nextProgram: { ...info.nextProgram, source: 'estimated' },
    fullSchedule: info.fullSchedule.map((programme) => ({ ...programme, source: 'estimated' })),
  };
}

export const EpgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<EpgLoadResult | null>(null);
  const [status, setStatus] = useState<EpgStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const runLoad = useCallback(async (force: boolean) => {
    setStatus('loading');
    try {
      const loaded = force ? await refreshEpg() : await loadEpg();
      setResult(loaded);
      if (loaded.guide.programmeCount > 0) {
        setStatus('ready');
        setError(null);
      } else {
        setStatus('empty');
        setError(loaded.errors[0] || 'Sem dados EPG disponíveis. A mostrar grelha estimada.');
      }
    } catch (loadError) {
      setStatus('error');
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Não competir com o primeiro render / carregamento dos canais.
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;

    if (typeof requestIdleCallback === 'function') {
      idleHandle = requestIdleCallback(() => void runLoad(false), { timeout: 3_000 });
    } else {
      timerHandle = window.setTimeout(() => void runLoad(false), 800);
    }

    return () => {
      if (idleHandle !== undefined && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };
  }, [runLoad]);

  const refresh = useCallback(async () => {
    await runLoad(true);
  }, [runLoad]);

  const guide = result?.guide;

  const resolveProgrammes = useCallback(
    (channel: Channel) => {
      if (!guide || guide.programmeCount === 0) return null;

      for (const key of channelKeys(channel)) {
        const programmes = guide.programmesByChannel.get(key);
        if (programmes && programmes.length > 0) return programmes;
      }

      // Alguns guias usam IDs diferentes do iptv-org. Tentamos o display-name.
      const normalizedName = normalizeName(channel.name);
      const xmltvChannel = guide.channels.find((candidate) =>
        candidate.names.some((name) => normalizeName(name) === normalizedName)
      );
      if (xmltvChannel) {
        const programmes = guide.programmesByChannel.get(normalizeChannelId(xmltvChannel.id));
        if (programmes && programmes.length > 0) return programmes;
      }

      return null;
    },
    [guide]
  );

  const getPrograms = useCallback(
    (channel: Channel): EPGProgram[] => {
      const programmes = resolveProgrammes(channel);
      if (programmes) return toEpgPrograms(channel, programmes, Date.now());
      return getChannelSchedule(channel).map((programme) => ({ ...programme, source: 'estimated' }));
    },
    [resolveProgrammes]
  );

  const getNowNext = useCallback(
    (channel: Channel): ProgramInfo => {
      const programmes = resolveProgrammes(channel);
      if (!programmes || programmes.length === 0) return fallbackNowNext(channel);

      const now = Date.now();
      const currentIndex = programmes.findIndex(
        (programme) => now >= programme.startMs && now < programme.stopMs
      );

      if (currentIndex === -1) return fallbackNowNext(channel);

      const current = programmes[currentIndex];
      const next =
        programmes[currentIndex + 1] || {
          ...current,
          startMs: current.stopMs,
          stopMs: current.stopMs + 60 * 60 * 1000,
          title: 'Emissão contínua',
        };
      const duration = Math.max(1, current.stopMs - current.startMs);
      const elapsed = Math.min(duration, Math.max(0, now - current.startMs));

      return {
        currentProgram: toEpgPrograms(channel, [current], now)[0],
        nextProgram: {
          ...toEpgPrograms(channel, [next], now)[0],
          id: `next-${channel.id}-${next.startMs}`,
          isLive: false,
          progressPercent: 0,
        },
        progressPercent: Math.round((elapsed / duration) * 100),
        formattedTime: formatTime(now),
        fullSchedule: toEpgPrograms(channel, programmes, now),
      };
    },
    [resolveProgrammes]
  );

  const hasRealEpg = useCallback(
    (channel: Channel) => Boolean(resolveProgrammes(channel)?.length),
    [resolveProgrammes]
  );

  const value = useMemo<EpgContextValue>(
    () => ({
      status,
      lastUpdated: result?.fetchedAt ?? null,
      sourceUrl: result?.sourceUrl ?? null,
      fromCache: result?.fromCache ?? false,
      stale: result?.stale ?? false,
      error,
      refresh,
      getPrograms,
      getNowNext,
      hasRealEpg,
    }),
    [status, result, error, refresh, getPrograms, getNowNext, hasRealEpg]
  );

  return <EpgContext.Provider value={value}>{children}</EpgContext.Provider>;
};

export function useEpg(): EpgContextValue {
  const context = useContext(EpgContext);
  if (!context) throw new Error('useEpg deve ser usado dentro de <EpgProvider>.');
  return context;
}
