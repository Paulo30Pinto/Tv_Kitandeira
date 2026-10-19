import React, { useEffect, useMemo, useState } from 'react';
import { Channel, Country, EPGProgram } from '../types';
import { useEpg } from '../src/epg/EpgContext';
import { Calendar, Play, Clock, Info, RefreshCw, Database, Sparkles, WifiOff } from 'lucide-react';

interface EPGGuideProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

const HOURS_TO_SHOW = 9;
const COUNTRIES: { label: string; value: Country | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Portugal', value: Country.PORTUGAL },
  { label: 'Angola', value: Country.ANGOLA },
  { label: 'Brasil', value: Country.BRASIL },
  { label: 'Moçambique', value: Country.MOCAMBIQUE },
  { label: 'Cabo Verde', value: Country.CABO_VERDE },
];

function startOfHour(ms: number): number {
  const date = new Date(ms);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

function timeToMs(time: string, reference: number): number {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(reference);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

function programmeBounds(programme: EPGProgram, windowStart: number): { start: number; end: number } {
  const start = programme.startMs ?? timeToMs(programme.startTime, windowStart);
  let end = programme.endMs ?? timeToMs(programme.endTime, windowStart);
  if (end <= start) end += 24 * 60 * 60 * 1000;
  return { start, end };
}

function relativeTime(ms: number | null): string {
  if (!ms) return 'sem cache';
  const diffMinutes = Math.max(0, Math.round((Date.now() - ms) / 60_000));
  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} dias`;
}

export const EPGGuide: React.FC<EPGGuideProps> = ({ channels, onSelectChannel }) => {
  const [selectedShow, setSelectedShow] = useState<{ channel: Channel; show: EPGProgram } | null>(null);
  const [country, setCountry] = useState<Country | 'ALL'>('ALL');
  const [onlyWithEpg, setOnlyWithEpg] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { status, lastUpdated, sourceUrl, fromCache, stale, error, refresh, getPrograms, hasRealEpg } = useEpg();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const windowStart = startOfHour(now) - 60 * 60 * 1000;
  const windowEnd = windowStart + HOURS_TO_SHOW * 60 * 60 * 1000;

  const hours = useMemo(
    () =>
      Array.from({ length: HOURS_TO_SHOW }, (_, index) => {
        const date = new Date(windowStart + index * 60 * 60 * 1000);
        return `${date.getHours().toString().padStart(2, '0')}:00`;
      }),
    [windowStart]
  );

  const visibleChannels = useMemo(
    () =>
      channels
        .filter((channel) => country === 'ALL' || channel.country === country)
        .filter((channel) => (onlyWithEpg ? hasRealEpg(channel) : true))
        .slice(0, 40),
    [channels, country, onlyWithEpg, hasRealEpg]
  );

  const realEpgCount = useMemo(() => channels.filter((channel) => hasRealEpg(channel)).length, [channels, hasRealEpg]);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar size={16} />
            <span>Guia Eletrónico de Programação</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Programação ao Vivo (EPG)
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {realEpgCount > 0
              ? `${realEpgCount} canais com grelha XMLTV real. Fonte: iptv-org / operadores.`
              : 'Ainda sem guia XMLTV carregado — a mostrar uma grelha estimada por categoria.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#121929] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Clock size={14} className="text-cyan-400" />
            <span>
              Agora:{' '}
              <strong className="text-white">
                {new Date(now).getHours().toString().padStart(2, '0')}:
                {new Date(now).getMinutes().toString().padStart(2, '0')}
              </strong>
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
              realEpgCount > 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
            title={sourceUrl || 'Nenhuma fonte XMLTV carregada'}
          >
            {realEpgCount > 0 ? <Database size={14} /> : <Sparkles size={14} />}
            <span>{realEpgCount > 0 ? (stale ? 'EPG em cache (offline)' : 'EPG XMLTV') : 'Grelha estimada'}</span>
          </div>

          <button
            onClick={() => void refresh()}
            disabled={status === 'loading'}
            className="flex items-center gap-2 bg-[#121929] hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-200 disabled:opacity-50"
            title="Forçar atualização do guia"
          >
            <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Status / filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {COUNTRIES.map((item) => (
          <button
            key={item.label}
            onClick={() => setCountry(item.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
              country === item.value
                ? 'bg-white text-slate-950 border-white'
                : 'bg-[#121929] text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}

        <button
          onClick={() => setOnlyWithEpg((value) => !value)}
          className={`ml-auto px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
            onlyWithEpg
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-[#121929] text-gray-300 border-white/10 hover:bg-white/10'
          }`}
        >
          Só com EPG real
        </button>
      </div>

      {(fromCache || stale || error) && (
        <div className="mb-4 flex items-start gap-2 text-[11px] text-gray-400 bg-[#101625] border border-white/10 rounded-xl px-3 py-2">
          {stale ? <WifiOff size={14} className="text-amber-400 mt-0.5" /> : <Info size={14} className="text-cyan-400 mt-0.5" />}
          <span>
            {fromCache ? `Cache local — atualizado ${relativeTime(lastUpdated)}. ` : ''}
            {stale ? 'Sem rede: a usar a última cópia guardada. ' : ''}
            {error || 'Pode forçar a atualização no botão acima.'}
          </span>
        </div>
      )}

      {/* Timeline Grid Container */}
      <div className="bg-[#0f1524] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Timeline Hours Header */}
        <div className="flex items-center border-b border-white/10 bg-[#0a0e18] sticky top-0 z-20 overflow-x-auto no-scrollbar">
          <div className="w-44 md:w-64 shrink-0 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-white/10 bg-[#0a0e18]">
            Canal
          </div>
          <div className="flex-1 flex min-w-[640px]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 px-2 py-3 text-center text-xs font-bold text-gray-300 border-r border-white/5 bg-[#0d1220]"
              >
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Channel Rows */}
        <div className="divide-y divide-white/5 overflow-x-auto">
          {visibleChannels.map((channel) => {
            const schedule = getPrograms(channel);
            const visible = schedule
              .map((programme) => ({ programme, ...programmeBounds(programme, windowStart) }))
              .filter(({ start, end }) => end > windowStart && start < windowEnd)
              .slice(0, 12);

            return (
              <div key={channel.id} className="flex items-stretch min-w-[820px] hover:bg-white/[0.02] transition-colors group">
                {/* Channel Label */}
                <button
                  onClick={() => onSelectChannel(channel)}
                  className="w-44 md:w-64 shrink-0 p-3 flex items-center gap-3 border-r border-white/10 text-left hover:bg-white/5 transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md overflow-hidden ${channel.logoColor}`}
                  >
                    {channel.logoImage ? (
                      <img src={channel.logoImage} alt={channel.name} className="h-5 w-auto object-contain" loading="lazy" />
                    ) : (
                      channel.watermark || channel.name.substring(0, 2)
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {channel.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      #{channel.channelNumber || '000'} • {channel.country}
                      {hasRealEpg(channel) ? ' • EPG' : ''}
                    </span>
                  </div>
                  <Play size={14} className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Programme Blocks, positioned on the real time axis */}
                <div className="relative flex-1 min-w-[640px] h-20">
                  {hours.map((_, index) => (
                    <div
                      key={index}
                      className="absolute inset-y-0 border-r border-white/5"
                      style={{ left: `${(index / HOURS_TO_SHOW) * 100}%` }}
                    />
                  ))}

                  {visible.length === 0 && (
                    <span className="absolute inset-0 flex items-center px-4 text-[11px] text-gray-500">
                      Sem programação para esta janela horária.
                    </span>
                  )}

                  {visible.map(({ programme, start, end }) => {
                    const left = Math.max(0, ((start - windowStart) / (windowEnd - windowStart)) * 100);
                    const width = Math.max(
                      2,
                      (Math.min(end, windowEnd) - Math.max(start, windowStart)) /
                        (windowEnd - windowStart) *
                        100
                    );

                    return (
                      <button
                        key={programme.id}
                        onClick={() => setSelectedShow({ channel, show: programme })}
                        className={`absolute inset-y-2 text-left p-2 rounded-xl border transition-all overflow-hidden flex flex-col justify-center ${
                          programme.isLive
                            ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 border-cyan-500/60 shadow-[0_0_15px_rgba(0,181,255,0.15)] hover:border-cyan-400'
                            : 'bg-[#151c2e]/70 border-white/5 hover:border-white/25'
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${programme.title} • ${programme.startTime}–${programme.endTime}`}
                      >
                        <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold mb-0.5">
                          {programme.isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                          <span>{programme.startTime} - {programme.endTime}</span>
                          {programme.source === 'estimated' && <span className="text-gray-500">• estimado</span>}
                        </div>
                        <span className="text-[11px] font-bold text-white truncate">{programme.title}</span>
                        {programme.isLive && (
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className="bg-[#00B5FF] h-full rounded-full transition-all duration-500"
                              style={{ width: `${programme.progressPercent || 0}%` }}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {visibleChannels.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">
            Nenhum canal corresponde aos filtros selecionados.
          </div>
        )}
      </div>

      {/* Show Info Modal */}
      {selectedShow && (
        <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121828] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white overflow-hidden ${selectedShow.channel.logoColor}`}
                >
                  {selectedShow.channel.watermark || 'TV'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedShow.channel.name}</h3>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    {selectedShow.show.startTime} - {selectedShow.show.endTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedShow(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                ✕ Fechar
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#00B5FF] bg-cyan-500/10 px-2 py-0.5 rounded-md uppercase">
                {selectedShow.show.category}
              </span>
              {selectedShow.show.source === 'estimated' && (
                <span className="ml-2 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase">
                  Estimado
                </span>
              )}
              <h2 className="text-lg font-bold text-white mt-2">{selectedShow.show.title}</h2>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                {selectedShow.show.description || 'Sem descrição disponível neste guia.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedShow(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  onSelectChannel(selectedShow.channel);
                  setSelectedShow(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00B5FF] hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Play size={14} />
                Assistir Canal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
