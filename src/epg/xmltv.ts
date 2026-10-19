/**
 * Parser XMLTV leve, sem dependências.
 *
 * Formato de datas XMLTV: YYYYMMDDHHmmss +ZZZZ (o fuso é opcional no standard,
 * mas os guias sérios incluem-no). Convertemos tudo para milissegundos UTC e
 * deixamos a apresentação para o browser, que aplica o fuso local.
 */

export interface XmltvProgramme {
  channelId: string;
  startMs: number;
  stopMs: number;
  title: string;
  description: string;
  category: string;
  icon?: string;
  episode?: string;
}

export interface XmltvChannel {
  id: string;
  names: string[];
}

export interface ParsedXmltv {
  channels: XmltvChannel[];
  programmesByChannel: Map<string, XmltvProgramme[]>;
  programmeCount: number;
  channelCount: number;
}

export interface ParseXmltvOptions {
  /** Só guarda programas destes canais (IDs normalizados ou originais). */
  channelIds?: Iterable<string>;
  /** Limite inferior (ms). Default: agora - 12h. */
  fromMs?: number;
  /** Limite superior (ms). Default: agora + 7 dias. */
  toMs?: number;
  /** Máximo de programas por canal (proteção de memória). */
  maxProgrammesPerChannel?: number;
}

export function normalizeChannelId(id: string | null | undefined): string {
  if (!id) return '';
  return id
    .trim()
    .replace(/@[A-Za-z0-9_-]+$/, '') // RTP1.pt@HD -> RTP1.pt
    .toLowerCase();
}

/**
 * Converte uma data XMLTV em ms UTC.
 * Exemplos aceites:
 *   20261019223000 +0100
 *   20261019223000
 *   2026-10-19T22:30:00+01:00
 */
export function parseXmltvDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();

  const iso = Date.parse(trimmed);
  if (!Number.isNaN(iso) && /[-:]/.test(trimmed)) return iso;

  const match = trimmed.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{2}:?\d{2})?$/);
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '00', offset] = match;
  let ms = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  if (offset) {
    const sign = offset.startsWith('-') ? -1 : 1;
    const digits = offset.replace(':', '').slice(1);
    const offsetMinutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4));
    ms -= sign * offsetMinutes * 60_000;
  }

  return Number.isFinite(ms) ? ms : null;
}

function firstText(parent: Element, tagName: string): string {
  const elements = parent.getElementsByTagName(tagName);
  return elements.length > 0 ? (elements[0].textContent || '').trim() : '';
}

function parseProgrammeElement(element: Element): XmltvProgramme | null {
  const channelId = element.getAttribute('channel');
  const startMs = parseXmltvDate(element.getAttribute('start'));
  const stopMs = parseXmltvDate(element.getAttribute('stop'));

  if (!channelId || startMs === null || stopMs === null || stopMs <= startMs) return null;

  const title = firstText(element, 'title') || 'Programa sem título';
  const description = firstText(element, 'desc');
  const category = firstText(element, 'category') || 'Outros';
  const icon = element.getElementsByTagName('icon')[0]?.getAttribute('src') || undefined;
  const episode = firstText(element, 'episode-num') || undefined;

  return { channelId, startMs, stopMs, title, description, category, icon, episode };
}

export function parseXmltv(xml: string, options: ParseXmltvOptions = {}): ParsedXmltv {
  if (typeof DOMParser === 'undefined') {
    throw new Error('parseXmltv precisa de DOMParser (browser). No Node use scripts/sync-epg.mjs.');
  }

  const fromMs = options.fromMs ?? Date.now() - 12 * 60 * 60 * 1000;
  const toMs = options.toMs ?? Date.now() + 7 * 24 * 60 * 60 * 1000;
  const maxPerChannel = options.maxProgrammesPerChannel ?? 500;

  const filter = options.channelIds ? new Set([...options.channelIds].map(normalizeChannelId)) : null;

  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XMLTV inválido: ${parserError.textContent?.slice(0, 200) || 'erro de parsing'}`);
  }

  const channels: XmltvChannel[] = [];
  for (const element of Array.from(document.getElementsByTagName('channel'))) {
    const id = element.getAttribute('id');
    if (!id) continue;
    const names = Array.from(element.getElementsByTagName('display-name'))
      .map((name) => (name.textContent || '').trim())
      .filter(Boolean);
    channels.push({ id, names });
  }

  const programmesByChannel = new Map<string, XmltvProgramme[]>();
  let programmeCount = 0;

  for (const element of Array.from(document.getElementsByTagName('programme'))) {
    const programme = parseProgrammeElement(element);
    if (!programme) continue;

    const key = normalizeChannelId(programme.channelId);
    if (!key) continue;
    if (filter && !filter.has(key)) continue;
    if (programme.stopMs < fromMs || programme.startMs > toMs) continue;

    const list = programmesByChannel.get(key) || [];
    if (list.length >= maxPerChannel) continue;
    list.push(programme);
    programmesByChannel.set(key, list);
    programmeCount += 1;
  }

  for (const [key, list] of programmesByChannel) {
    list.sort((a, b) => a.startMs - b.startMs);
    // Remove duplicados (mesmo canal, início e título) que aparecem em fusões.
    const deduped = list.filter(
      (programme, index) =>
        index === 0 ||
        programme.startMs !== list[index - 1].startMs ||
        programme.title !== list[index - 1].title
    );
    programmesByChannel.set(key, deduped);
  }

  return {
    channels,
    programmesByChannel,
    programmeCount,
    channelCount: programmesByChannel.size,
  };
}

/** Junta dois guias já parseados, dando prioridade ao segundo em caso de conflito. */
export function mergeParsedXmltv(base: ParsedXmltv, incoming: ParsedXmltv): ParsedXmltv {
  const merged = new Map<string, XmltvProgramme[]>();

  for (const [key, programmes] of base.programmesByChannel) merged.set(key, [...programmes]);

  for (const [key, programmes] of incoming.programmesByChannel) {
    const existing = merged.get(key) || [];
    const seen = new Set(existing.map((programme) => `${programme.startMs}:${programme.title}`));
    const additions = programmes.filter(
      (programme) => !seen.has(`${programme.startMs}:${programme.title}`)
    );
    merged.set(key, [...existing, ...additions].sort((a, b) => a.startMs - b.startMs));
  }

  const channelMap = new Map<string, XmltvChannel>();
  for (const channel of [...base.channels, ...incoming.channels]) {
    channelMap.set(channel.id.toLowerCase(), channel);
  }

  return {
    channels: [...channelMap.values()],
    programmesByChannel: merged,
    programmeCount: [...merged.values()].reduce((total, list) => total + list.length, 0),
    channelCount: merged.size,
  };
}
