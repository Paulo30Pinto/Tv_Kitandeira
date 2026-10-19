import { CHANNELS } from '../../constants';
import { Channel, StreamType } from '../../types';
import { LUSOFONIA_CHANNELS } from './lusofonia';

/**
 * Junta o catálogo histórico da TeIP com a lista curada da lusofonia.
 *
 * Regras:
 *  - a lista curada tem prioridade quando existe o mesmo nome de canal
 *    (ex.: RTP África e TV Zimbo estavam duplicados e com URLs erradas em
 *    `constants.ts`);
 *  - os canais antigos mantêm os IDs e os números (001–029) para não quebrar
 *    favoritos guardados em localStorage;
 *  - os canais da lusofonia usam IDs prefixados (`lusofonia-*`) e números 100+.
 */

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const curatedNames = new Set(LUSOFONIA_CHANNELS.map((channel) => normalizeName(channel.name)));

function normalizeLegacyChannel(channel: Channel): Channel {
  const isYouTubeUrl = /youtube\.com|youtu\.be/i.test(channel.streamUrl);
  // Corrige metadados antigos em que o tipo não corresponde ao URL.
  const type =
    channel.type === StreamType.YOUTUBE && !isYouTubeUrl
      ? StreamType.HLS
      : channel.type;

  return { ...channel, type, source: channel.source || 'teip' };
}

const legacyChannels: Channel[] = CHANNELS.filter(
  (channel) => !curatedNames.has(normalizeName(channel.name))
).map(normalizeLegacyChannel);

export const ALL_CHANNELS: Channel[] = [...legacyChannels, ...LUSOFONIA_CHANNELS];

export const LUSOFONIA_COUNT = LUSOFONIA_CHANNELS.length;

export function getChannelById(id: string): Channel | undefined {
  return ALL_CHANNELS.find((channel) => channel.id === id);
}

export function isLusofoniaChannel(channel: Channel): boolean {
  return channel.source === 'iptv-org';
}
