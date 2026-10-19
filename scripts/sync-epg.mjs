#!/usr/bin/env node
/**
 * sync-epg.mjs
 * ---------------------------------------------------------------------------
 * Constrói um guia XMLTV único (`public/epg/lusofonia.xml`) para os canais da
 * lista curada, a partir das fontes oficiais do iptv-org:
 *
 *   https://iptv-org.github.io/api/guides.json
 *
 * O guia gerado é publicado juntamente com a app. O browser descarrega-o uma
 * vez, guarda-o em IndexedDB e usa a cópia local quando está offline.
 *
 * Uso:
 *   node scripts/sync-epg.mjs
 *   node scripts/sync-epg.mjs --max-sources=25 --verbose
 *   node scripts/sync-epg.mjs --input=guide.xml        # testar com um XMLTV local
 *
 * Variáveis:
 *   EPG_GUIDES_FILE=/caminho/guides.json   # usa um guias.json local
 *   EPG_FIXTURE_DIR=/caminho/xmls          # resolve URLs para ficheiros locais
 *   EPG_MAX_SOURCES=40
 *
 * Sem dependências externas (Node >= 18).
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GENERATED_PATH = path.join(ROOT, 'data', 'lusofonia.generated.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'epg');
const OUTPUT_XML = path.join(OUTPUT_DIR, 'lusofonia.xml');
const OUTPUT_META = path.join(OUTPUT_DIR, 'lusofonia.meta.json');

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const VERBOSE = hasFlag('--verbose');
const INPUT_FILE = getArg('input', process.env.EPG_INPUT_FILE || null);
const MAX_SOURCES = Number(getArg('max-sources', process.env.EPG_MAX_SOURCES || 40));
const GUIDES_URL = process.env.EPG_GUIDES_URL || 'https://iptv-org.github.io/api/guides.json';
const GUIDES_FILE = process.env.EPG_GUIDES_FILE || null;
const FIXTURE_DIR = process.env.EPG_FIXTURE_DIR || null;
const USER_AGENT = 'TeIP-Lusofonia-EPG/1.0 (+https://github.com/Paulo30Pinto/Tv_Kitandeira)';

const log = (...values) => console.log('[epg]', ...values);
const debug = (...values) => (VERBOSE ? console.log('[epg:debug]', ...values) : undefined);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/* HTTP                                                                        */
/* -------------------------------------------------------------------------- */

async function fetchBuffer(url, { timeout = 40_000, retries = 1 } = {}) {
  if (FIXTURE_DIR) {
    const local = path.join(FIXTURE_DIR, path.basename(new URL(url, 'https://example.com').pathname));
    debug(`fixture ${url} -> ${local}`);
    return fs.readFile(local);
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept: 'application/xml, text/xml, application/json, application/gzip, */*',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(800 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function decodeXml(buffer) {
  // gzip estático (.xml.gz) — fetch do Node só descomprime Content-Encoding.
  if (buffer.length > 1 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    buffer = zlib.gunzipSync(buffer);
  }

  const head = buffer.subarray(0, 200).toString('latin1');
  const declaresLatin1 = /encoding=["'](iso-8859-1|windows-1252|latin1)/i.test(head);
  if (declaresLatin1) {
    // Buffer.toString('latin1') cobre windows-1252 nos caracteres usados em EPG.
    return buffer.toString('latin1');
  }
  return buffer.toString('utf8');
}

/* -------------------------------------------------------------------------- */
/* XMLTV                                                                       */
/* -------------------------------------------------------------------------- */

const XMLTV_DATE = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{2}:?\d{2})?$/;

function parseXmltvDate(value) {
  if (!value) return null;
  const match = value.trim().match(XMLTV_DATE);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '00', offset] = match;
  let ms = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  if (offset) {
    const sign = offset.startsWith('-') ? -1 : 1;
    const digits = offset.replace(':', '').slice(1);
    ms -= sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4))) * 60_000;
  }
  return ms;
}

function formatXmltvDate(ms) {
  const date = new Date(ms);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())} +0000`;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function normalizeId(id) {
  return String(id || '').trim().replace(/@[A-Za-z0-9_-]+$/, '').toLowerCase();
}

function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function firstTag(block, tag) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  if (!match) return '';
  const withoutCdata = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return unescapeXml(withoutCdata.replace(/<[^>]+>/g, '').trim());
}

function parseXmltv(xml) {
  const channels = [];
  const channelRegex = /<channel\s+([^>]*?)>([\s\S]*?)<\/channel>/gi;
  let channelMatch;
  while ((channelMatch = channelRegex.exec(xml)) !== null) {
    const attrs = channelMatch[1];
    const idMatch = /id\s*=\s*"([^"]+)"/i.exec(attrs);
    if (!idMatch) continue;
    const names = [];
    const nameRegex = /<display-name[^>]*>([\s\S]*?)<\/display-name>/gi;
    let nameMatch;
    while ((nameMatch = nameRegex.exec(channelMatch[2])) !== null) {
      const name = unescapeXml(nameMatch[1].replace(/<[^>]+>/g, '').trim());
      if (name) names.push(name);
    }
    channels.push({ id: idMatch[1], names });
  }

  const programmes = [];
  const programmeRegex = /<programme\s+([^>]*?)>([\s\S]*?)<\/programme>/gi;
  let match;
  while ((match = programmeRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const body = match[2];
    const getAttr = (name) => {
      const attr = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attrs);
      return attr ? unescapeXml(attr[1]) : null;
    };

    const channel = getAttr('channel');
    const startMs = parseXmltvDate(getAttr('start'));
    const stopMs = parseXmltvDate(getAttr('stop'));
    if (!channel || startMs === null || stopMs === null || stopMs <= startMs) continue;

    programmes.push({
      channel,
      startMs,
      stopMs,
      title: firstTag(body, 'title') || 'Programa sem título',
      description: firstTag(body, 'desc'),
      category: firstTag(body, 'category') || 'Outros',
      episode: firstTag(body, 'episode-num'),
      icon: (/<icon[^>]*src\s*=\s*"([^"]+)"/i.exec(body) || [])[1] || null,
    });
  }

  return { channels, programmes };
}

/* -------------------------------------------------------------------------- */
/* Descoberta de fontes                                                        */
/* -------------------------------------------------------------------------- */

function gatherSources(guides, targets) {
  const byId = new Map(targets.map((target) => [target.id.toLowerCase(), target]));
  const byName = new Map(targets.map((target) => [normalizeName(target.name), target]));
  const sources = new Map(); // url -> { url, targetIds:Set }

  for (const guide of guides) {
    const channelId = normalizeId(guide.channel || '');
    let target = byId.get(channelId) || null;

    if (!target && guide.site_name) target = byName.get(normalizeName(guide.site_name)) || null;
    if (!target && guide.channel) target = byName.get(normalizeName(guide.channel)) || null;
    if (!target) continue;

    const list = Array.isArray(guide.sources)
      ? guide.sources
      : guide.url
      ? [{ url: guide.url }]
      : [];

    for (const source of list) {
      const url = typeof source === 'string' ? source : source?.url;
      if (!url || !/^https?:\/\//i.test(url)) continue;

      const entry = sources.get(url) || { url, targetIds: new Set() };
      entry.targetIds.add(target.id);
      sources.set(url, entry);
    }
  }

  return [...sources.values()];
}

/**
 * Mapeia os IDs do XMLTV para os IDs da nossa base.
 * 1) igualdade normalizada com epgId;
 * 2) display-name igual ao nome curado;
 * 3) se a fonte foi descoberta para um canal e só tem um <channel>, usa esse canal.
 */
function buildChannelMap(parsed, targetsByEpgId, targetsByName, fallbackTargetId) {
  const map = new Map();

  for (const channel of parsed.channels) {
    const normalized = normalizeId(channel.id);
    if (targetsByEpgId.has(normalized)) {
      map.set(channel.id, targetsByEpgId.get(normalized));
      continue;
    }

    const nameTarget = channel.names
      .map((name) => targetsByName.get(normalizeName(name)))
      .find(Boolean);

    if (nameTarget) {
      map.set(channel.id, nameTarget);
    }
  }

  if (map.size === 0 && fallbackTargetId && parsed.channels.length === 1) {
    map.set(parsed.channels[0].id, fallbackTargetId);
  }

  return map;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const generated = JSON.parse(await fs.readFile(GENERATED_PATH, 'utf8'));
  const targets = generated.channels
    .filter((channel) => channel.epgId)
    .map((channel) => ({ id: channel.epgId, name: channel.name, tvgId: channel.tvgId }));

  if (targets.length === 0) {
    throw new Error('Nenhum canal com epgId em data/lusofonia.generated.json.');
  }

  const targetsByEpgId = new Map(targets.map((target) => [normalizeId(target.id), target.id]));
  const targetsByName = new Map(targets.map((target) => [normalizeName(target.name), target.id]));
  const targetNamesById = new Map(targets.map((target) => [normalizeId(target.id), target.name]));
  const now = Date.now();
  const fromMs = now - 12 * 60 * 60 * 1000;
  const toMs = now + 7 * 24 * 60 * 60 * 1000;

  let sourcePlans = [];

  if (INPUT_FILE) {
    log(`modo ficheiro único: ${INPUT_FILE}`);
    sourcePlans = [{ url: INPUT_FILE, targetIds: new Set(targets.map((target) => target.id)) }];
  } else {
    let guides;
    if (GUIDES_FILE) {
      guides = JSON.parse(await fs.readFile(GUIDES_FILE, 'utf8'));
      log(`guias locais: ${GUIDES_FILE}`);
    } else {
      log(`a obter ${GUIDES_URL}`);
      guides = JSON.parse((await fetchBuffer(GUIDES_URL)).toString('utf8'));
    }

    if (!Array.isArray(guides)) throw new Error('guides.json não é um array.');

    sourcePlans = gatherSources(guides, targets).slice(0, MAX_SOURCES);
    log(`${sourcePlans.length} fontes XMLTV para ${targets.length} canais (máx. ${MAX_SOURCES})`);
  }

  if (sourcePlans.length === 0) {
    log('Nenhuma fonte encontrada. O ficheiro existente (se houver) foi mantido.');
    return;
  }

  const mergedChannels = new Map(); // targetId -> { names:Set }
  const mergedProgrammes = []; // { targetId, startMs, stopMs, ... }
  const seenProgrammes = new Set();
  const usedSources = [];
  const failedSources = [];

  for (const plan of sourcePlans) {
    const url = plan.url;
    if (!/^https?:\/\//i.test(url) && !INPUT_FILE) {
      debug(`ignorado (não http): ${url}`);
      continue;
    }

    try {
      const buffer = INPUT_FILE ? await fs.readFile(url) : await fetchBuffer(url);
      const xml = decodeXml(buffer);
      if (!xml.includes('<tv')) throw new Error('resposta não é XMLTV');

      const parsed = parseXmltv(xml);
      const fallbackTargetId = plan.targetIds.size === 1 ? [...plan.targetIds][0] : null;
      const channelMap = buildChannelMap(parsed, targetsByEpgId, targetsByName, fallbackTargetId);

      if (channelMap.size === 0) {
        failedSources.push({ url, reason: `${parsed.channels.length} canais, nenhum corresponde à curadoria` });
        continue;
      }

      let added = 0;
      for (const programme of parsed.programmes) {
        const targetId = channelMap.get(programme.channel);
        if (!targetId) continue;
        if (programme.stopMs < fromMs || programme.startMs > toMs) continue;

        const key = `${targetId}:${programme.startMs}:${programme.title}`;
        if (seenProgrammes.has(key)) continue;
        seenProgrammes.add(key);

        if (!mergedChannels.has(targetId)) mergedChannels.set(targetId, { names: new Set() });
        const targetChannel = targetsByEpgId.get(normalizeId(targetId));
        if (targetChannel) mergedChannels.get(targetId).names.add(targetChannel);

        mergedProgrammes.push({ ...programme, targetId });
        added += 1;
      }

      if (added > 0) {
        usedSources.push({ url, channels: [...channelMap.values()], programmes: added });
        log(`  + ${added} programas de ${url}`);
      } else {
        failedSources.push({ url, reason: 'sem programas na janela de 7 dias' });
      }
    } catch (error) {
      failedSources.push({ url, reason: error.message });
      log(`  ! falhou ${url}: ${error.message}`);
    }

    await sleep(100);
  }

  if (mergedProgrammes.length === 0) {
    log('Nenhum programa válido obtido. O ficheiro existente foi mantido.');
    for (const failure of failedSources.slice(0, 10)) log(`  - ${failure.reason}: ${failure.url}`);
    return;
  }

  mergedProgrammes.sort((a, b) => a.startMs - b.startMs || a.targetId.localeCompare(b.targetId));

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE tv SYSTEM "xmltv.dtd">',
    '<tv generator-info-name="TeIP / iptv-org EPG sync" generator-info-url="https://github.com/Paulo30Pinto/Tv_Kitandeira">',
  ];

  const channelIds = [...mergedChannels.keys()].sort();
  for (const id of channelIds) {
    const name = targetNamesById.get(normalizeId(id)) || id;
    lines.push(`  <channel id="${escapeXml(id)}">`);
    lines.push(`    <display-name>${escapeXml(name)}</display-name>`);
    lines.push('  </channel>');
  }

  for (const programme of mergedProgrammes) {
    lines.push(
      `  <programme channel="${escapeXml(programme.targetId)}" start="${formatXmltvDate(
        programme.startMs
      )}" stop="${formatXmltvDate(programme.stopMs)}">`
    );
    lines.push(`    <title lang="pt">${escapeXml(programme.title)}</title>`);
    if (programme.description) lines.push(`    <desc lang="pt">${escapeXml(programme.description)}</desc>`);
    if (programme.category) lines.push(`    <category lang="pt">${escapeXml(programme.category)}</category>`);
    if (programme.episode) lines.push(`    <episode-num system="xmltv_ns">${escapeXml(programme.episode)}</episode-num>`);
    lines.push('  </programme>');
  }

  lines.push('</tv>', '');

  await fs.writeFile(OUTPUT_XML, lines.join('\n'), 'utf8');
  await fs.writeFile(
    OUTPUT_META,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        generator: 'scripts/sync-epg.mjs',
        guidesSource: GUIDES_FILE || GUIDES_URL,
        channels: channelIds.length,
        programmes: mergedProgrammes.length,
        sources: usedSources,
        failedSources,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  const size = (await fs.stat(OUTPUT_XML)).size;
  log(`escrito ${path.relative(ROOT, OUTPUT_XML)} — ${channelIds.length} canais, ${mergedProgrammes.length} programas, ${(size / 1024).toFixed(0)} KB`);
  if (failedSources.length > 0) log(`${failedSources.length} fontes falharam ou ficaram vazias (ver metadata).`);
}

main().catch((error) => {
  console.error('[epg] erro fatal:', error.message);
  process.exitCode = 1;
});
