import { Category, Channel, Country, LiveStatus, StreamType } from '../../types';
import generated from '../../data/lusofonia.generated.json';

/**
 * Adaptador entre a lista gerada pelo pipeline (`scripts/sync-lusofonia.mjs`)
 * e o modelo `Channel` usado pela aplicação.
 *
 * O ficheiro JSON é gerado automaticamente. Não editar à mão:
 * edite `data/lusofonia.curation.json` e volte a correr o script.
 */

export interface GeneratedChannel {
  id: string;
  tvgId: string | null;
  epgId: string | null;
  name: string;
  country: 'PT' | 'AO' | 'BR' | 'MZ' | 'CV' | 'ST' | 'TL' | 'GW' | string;
  appCategory: string;
  rights: string;
  language: string;
  logo: string | null;
  streamUrl: string;
  alternateStreams: string[];
  headers?: Record<string, string>;
  labels: string[];
  quality: string | null;
  status: 'verified' | 'unverified' | 'offline' | 'youtube';
  checkedAt: string | null;
  notes: string | null;
}

export interface GeneratedPlaylist {
  schemaVersion: number;
  generatedAt: string;
  generator: string;
  upstream: {
    project: string;
    lists: Record<string, string>;
  };
  stats: {
    curated: number;
    included: number;
    verified: number;
    unverified: number;
    offline: number;
    youtube: number;
    noSource: number;
    invalid: number;
    skipped: number;
  };
  channels: GeneratedChannel[];
}

const playlist = generated as GeneratedPlaylist;

const COUNTRY_META: Record<string, { country: Country; color: string; label: string }> = {
  PT: { country: Country.PORTUGAL, color: 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-red-800', label: 'Portugal' },
  AO: { country: Country.ANGOLA, color: 'bg-gradient-to-br from-red-700 via-red-800 to-slate-900', label: 'Angola' },
  BR: { country: Country.BRASIL, color: 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-yellow-500', label: 'Brasil' },
  MZ: { country: Country.MOCAMBIQUE, color: 'bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900', label: 'Moçambique' },
  CV: { country: Country.CABO_VERDE, color: 'bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900', label: 'Cabo Verde' },
  ST: { country: Country.SAO_TOME, color: 'bg-gradient-to-br from-emerald-700 to-slate-900', label: 'São Tomé e Príncipe' },
  TL: { country: Country.TIMOR_LESTE, color: 'bg-gradient-to-br from-red-700 to-amber-600', label: 'Timor-Leste' },
  GW: { country: Country.GUINE_BISSAU, color: 'bg-gradient-to-br from-red-700 via-yellow-600 to-emerald-700', label: 'Guiné-Bissau' },
};

const CATEGORY_MAP: Record<string, Category> = {
  'Variedades': Category.GENERAL,
  'Notícias': Category.NEWS,
  'Infantil': Category.KIDS,
  'Desporto': Category.SPORTS,
  'Educação & Gov': Category.EDUCATION,
  'Internacional': Category.INTERNATIONAL,
  'Música': Category.MUSIC,
  'Filme': Category.MOVIES,
  'Novelas': Category.NOVELAS,
  'Séries': Category.SERIES,
  'Desenhos': Category.CARTOON,
  'Anime': Category.ANIME,
};

function toResolution(quality: string | null): Channel['resolution'] {
  if (!quality) return undefined;
  if (quality.includes('2160') || /4k/i.test(quality)) return '4K';
  if (quality.includes('1080')) return '1080p';
  if (quality.includes('720')) return '720p';
  if (quality.includes('480')) return '480p';
  if (quality.includes('360')) return '360p';
  return undefined;
}

function toStatus(status: GeneratedChannel['status']): LiveStatus {
  if (status === 'offline') return 'OFFLINE';
  if (status === 'verified' || status === 'youtube') return 'ONLINE';
  // Ainda não foi testado: não prometer "AO VIVO" sem prova.
  return 'UNVERIFIED';
}

function buildDescription(channel: GeneratedChannel, countryLabel: string): string {
  const source = channel.status === 'youtube' ? 'canal oficial no YouTube' : 'stream público listado pelo iptv-org';
  const rights = channel.rights === 'public' ? 'Serviço público' : 'Emissão do operador';
  return `${channel.name} — ${rights} de ${countryLabel}. Fonte: ${source}.${
    channel.notes ? ` ${channel.notes}` : ''
  }`;
}

export const LUSOFONIA_PLAYLIST_META = {
  generatedAt: playlist.generatedAt,
  upstream: playlist.upstream,
  stats: playlist.stats,
};

export const LUSOFONIA_CHANNELS: Channel[] = playlist.channels.map((channel, index) => {
  const meta = COUNTRY_META[channel.country] || { country: Country.GLOBAL, color: 'bg-slate-800', label: 'Lusofonia' };
  const isYouTube = channel.status === 'youtube' || /youtube\.com|youtu\.be/i.test(channel.streamUrl);

  return {
    id: `lusofonia-${channel.id.toLowerCase()}`,
    channelNumber: (100 + index).toString().padStart(3, '0'),
    name: channel.name,
    description: buildDescription(channel, meta.label),
    logoColor: meta.color,
    logoImage: channel.logo || undefined,
    watermark: channel.name
      .replace(/[^\p{L}\p{N} ]/gu, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3),
    streamUrl: channel.streamUrl,
    alternateStreams: channel.alternateStreams,
    headers: channel.headers,
    type: isYouTube ? StreamType.YOUTUBE : StreamType.HLS,
    country: meta.country,
    category: CATEGORY_MAP[channel.appCategory] || Category.GENERAL,
    language: channel.language || 'Português',
    resolution: toResolution(channel.quality),
    status: toStatus(channel.status),
    tvgId: channel.tvgId || undefined,
    epgId: channel.epgId || undefined,
    source: 'iptv-org',
    rights: (channel.rights as Channel['rights']) || 'review',
    labels: channel.labels,
    group: channel.appCategory,
  } as Channel;
});

export const LUSOFONIA_BY_ID = new Map(LUSOFONIA_CHANNELS.map((channel) => [channel.id, channel]));

export function getLusofoniaChannelName(epgId: string): string | undefined {
  return LUSOFONIA_CHANNELS.find((channel) => channel.epgId === epgId)?.name;
}
