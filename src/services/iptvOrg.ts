import { Country, LiveChannel } from '../../types';

export const IPTV_ORG_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/pt.m3u';
export const IPTV_ORG_EPG_URL = 'https://iptv-org.github.io/epg/guides/pt.xml';
const CACHE_KEY = 'tv-kitandeira-iptv-org-cache-v1';
const CACHE_TTL = 6 * 60 * 60 * 1000;

interface CachedPlaylist {
  channels: LiveChannel[];
  updatedAt: number;
}

const countryFromGroup = (group = ''): Country => {
  const value = group.toLowerCase();
  if (value.includes('brazil') || value.includes('brasil')) return Country.BRASIL;
  if (value.includes('angola')) return Country.ANGOLA;
  if (value.includes('portugal')) return Country.PORTUGAL;
  return Country.GLOBAL;
};

const attribute = (line: string, name: string) =>
  line.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1]?.trim() || '';

export function parseIptvOrgPlaylist(input: string): LiveChannel[] {
  const lines = input.split(/\r?\n/);
  const channels: LiveChannel[] = [];
  let metadata: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.indexOf(',');
      const name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : 'Canal sem nome';
      metadata = {
        id: attribute(line, 'tvg-id'),
        logo: attribute(line, 'tvg-logo'),
        group: attribute(line, 'group-title'),
        language: attribute(line, 'tvg-language'),
        name,
      };
      continue;
    }
    if (line.startsWith('#') || !metadata.name) continue;

    channels.push({
      id: `iptv-${metadata.id || metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: metadata.name,
      category: metadata.group || 'Lusofonia',
      logo: metadata.logo,
      streamUrl: line,
      status: 'Online',
      isLive: true,
      country: countryFromGroup(metadata.group),
      language: metadata.language || 'por',
      epgId: metadata.id,
      source: 'iptv-org',
    });
    metadata = {};
  }
  return channels;
}

function readCache(): CachedPlaylist | null {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedPlaylist) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in private browsing; the live response still works.
  }
}

export async function loadIptvOrgChannels(): Promise<{ channels: LiveChannel[]; updatedAt: number; fromCache: boolean }> {
  const cached = readCache();
  const hasFreshCache = cached && Date.now() - cached.updatedAt < CACHE_TTL;
  if (hasFreshCache) return { ...cached, fromCache: true };

  try {
    const response = await fetch(IPTV_ORG_PLAYLIST_URL, { headers: { Accept: 'text/plain' } });
    if (!response.ok) throw new Error(`Playlist request failed: ${response.status}`);
    const channels = parseIptvOrgPlaylist(await response.text()).filter((channel) => channel.language?.startsWith('por'));
    const result = { channels, updatedAt: Date.now() };
    writeCache(result);
    return { ...result, fromCache: false };
  } catch {
    if (cached) return { ...cached, fromCache: true };
    return { channels: [], updatedAt: 0, fromCache: false };
  }
}
