import { EPGProgram } from '../../types';

export const IPTV_ORG_EPG_URL = 'https://iptv-org.github.io/epg/guides/pt.xml';
const CACHE_KEY = 'tv-kitandeira-iptv-org-epg-v1';
const CACHE_TTL = 6 * 60 * 60 * 1000;

interface CachedEpg {
  programs: EPGProgram[];
  updatedAt: number;
}

const text = (node: Element | null, selector: string) =>
  node?.querySelector(selector)?.textContent?.trim() || '';

const parseXmltvDate = (value: string) => {
  const match = value.match(/^(\d{14})\s*([+-]\d{4})?/);
  if (!match) return '';
  const digits = match[1];
  const iso = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T${digits.slice(8, 10)}:${digits.slice(10, 12)}:${digits.slice(12, 14)}`;
  const offset = match[2] ? `${match[2].slice(0, 3)}:${match[2].slice(3)}` : 'Z';
  return new Date(`${iso}${offset}`).toISOString();
};

export function parseXmltv(input: string): EPGProgram[] {
  const document = new DOMParser().parseFromString(input, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('XMLTV inválido');

  return Array.from(document.querySelectorAll('programme')).flatMap((programme, index) => {
    const channelId = programme.getAttribute('channel') || '';
    const start = parseXmltvDate(programme.getAttribute('start') || '');
    const end = parseXmltvDate(programme.getAttribute('stop') || '');
    const title = text(programme, 'title');
    if (!channelId || !start || !end || !title) return [];

    return [{
      id: `xmltv-${channelId}-${start}-${index}`,
      channelId,
      title,
      description: text(programme, 'desc'),
      startTime: start,
      endTime: end,
      category: text(programme, 'category') || 'Geral',
      isLive: Date.now() >= Date.parse(start) && Date.now() < Date.parse(end),
    }];
  });
}

const readCache = (): CachedEpg | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export async function loadIptvOrgEpg(force = false): Promise<{ programs: EPGProgram[]; updatedAt: number; fromCache: boolean }> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.updatedAt < CACHE_TTL) return { ...cached, fromCache: true };

  try {
    const response = await fetch(IPTV_ORG_EPG_URL, { headers: { Accept: 'application/xml, text/xml' } });
    if (!response.ok) throw new Error(`EPG request failed: ${response.status}`);
    const result = { programs: parseXmltv(await response.text()), updatedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    return { ...result, fromCache: false };
  } catch {
    return cached ? { ...cached, fromCache: true } : { programs: [], updatedAt: 0, fromCache: false };
  }
}
