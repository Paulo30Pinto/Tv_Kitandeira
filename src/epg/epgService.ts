import epgConfig from '../../data/epg.sources.json';
import { getGuideXml, clearEpgCache } from './epgCache';
import { mergeParsedXmltv, ParsedXmltv, parseXmltv } from './xmltv';

export interface EpgConfig {
  snapshotUrl: string;
  sources: string[];
  refreshHours: number;
  maxStaleHours: number;
  maxDays: number;
}

export interface EpgLoadResult {
  guide: ParsedXmltv;
  sourceUrl: string | null;
  fetchedAt: number | null;
  fromCache: boolean;
  stale: boolean;
  errors: string[];
}

const config = epgConfig as EpgConfig;

const EMPTY_GUIDE: ParsedXmltv = {
  channels: [],
  programmesByChannel: new Map(),
  programmeCount: 0,
  channelCount: 0,
};

let memoryGuide: EpgLoadResult | null = null;
let inflight: Promise<EpgLoadResult> | null = null;

function candidateUrls(): string[] {
  return [config.snapshotUrl, ...(config.sources || [])].filter(Boolean);
}

async function loadOnce(force: boolean): Promise<EpgLoadResult> {
  const errors: string[] = [];
  const urls = candidateUrls();

  if (urls.length === 0) {
    return { guide: EMPTY_GUIDE, sourceUrl: null, fetchedAt: null, fromCache: false, stale: false, errors: ['Nenhuma fonte EPG configurada.'] };
  }

  for (const url of urls) {
    try {
      const cached = await getGuideXml(url, {
        force,
        refreshHours: config.refreshHours ?? 6,
        maxStaleHours: config.maxStaleHours ?? 168,
      });

      const now = Date.now();
      const windowMs = (config.maxDays ?? 7) * 24 * 60 * 60 * 1000;
      const result = parseXmltv(cached.xml, {
        fromMs: now - 12 * 60 * 60 * 1000,
        toMs: now + windowMs,
      });

      if (result.programmeCount === 0) {
        errors.push(`${url}: guia sem programas na janela actual.`);
        continue;
      }

      return {
        guide: result,
        sourceUrl: url,
        fetchedAt: cached.fetchedAt,
        fromCache: cached.fromCache,
        stale: cached.stale,
        errors,
      };
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Se existir uma cópia em memória (sessão anterior), usa-a como último recurso.
  if (memoryGuide && memoryGuide.guide.programmeCount > 0) {
    return { ...memoryGuide, stale: true, errors };
  }

  return {
    guide: EMPTY_GUIDE,
    sourceUrl: null,
    fetchedAt: null,
    fromCache: false,
    stale: false,
    errors,
  };
}

export async function loadEpg(options: { force?: boolean } = {}): Promise<EpgLoadResult> {
  if (!options.force && memoryGuide && memoryGuide.guide.programmeCount > 0) {
    const age = Date.now() - (memoryGuide.fetchedAt || 0);
    if (age < (config.refreshHours ?? 6) * 60 * 60 * 1000) return memoryGuide;
  }

  if (inflight) return inflight;

  inflight = loadOnce(Boolean(options.force))
    .then((result) => {
      if (result.guide.programmeCount > 0) memoryGuide = result;
      return result;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export async function refreshEpg(): Promise<EpgLoadResult> {
  memoryGuide = null;
  return loadEpg({ force: true });
}

export async function clearEpg(): Promise<void> {
  memoryGuide = null;
  await clearEpgCache();
}

export function getEpgConfig(): EpgConfig {
  return config;
}

export function mergeGuides(a: ParsedXmltv, b: ParsedXmltv): ParsedXmltv {
  return mergeParsedXmltv(a, b);
}
