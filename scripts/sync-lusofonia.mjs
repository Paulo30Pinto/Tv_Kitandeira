#!/usr/bin/env node
/**
 * sync-lusofonia.mjs
 * ---------------------------------------------------------------------------
 * Gera a lista curada de canais lusófonos a partir do iptv-org/iptv.
 *
 * Uso:
 *   node scripts/sync-lusofonia.mjs                 # gera data/lusofonia.generated.json
 *   node scripts/sync-lusofonia.mjs --check         # testa cada stream (HTTP) antes de gravar
 *   node scripts/sync-lusofonia.mjs --check --strict# remove canais cujo único stream falhou
 *
 * Variáveis de ambiente úteis:
 *   IPTV_STREAMS_DIR=/caminho/para/streams   # usa ficheiros locais em vez de descarregar
 *   IPTV_OFFLINE=1                           # igual ao anterior quando o diretório é ./vendor/iptv
 *
 * O script não tem dependências externas (Node >= 18, fetch nativo).
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CURATION_PATH = path.join(ROOT, 'data', 'lusofonia.curation.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'lusofonia.generated.json');

const argv = new Set(process.argv.slice(2));
const CHECK = argv.has('--check');
const STRICT = argv.has('--strict');
const VERBOSE = argv.has('--verbose');
const STREAMS_DIR = process.env.IPTV_STREAMS_DIR || (process.env.IPTV_OFFLINE ? path.join(ROOT, 'vendor', 'iptv', 'streams') : null);

const UPSTREAM_BASE = 'https://iptv-org.github.io/iptv/streams';
const UPSTREAM_FALLBACK = 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams';
const USER_AGENT = 'TeIP-Lusofonia-Sync/1.0 (+https://github.com/Paulo30Pinto/Tv_Kitandeira)';

const log = (...args) => console.log('[lusofonia]', ...args);
const debug = (...args) => (VERBOSE ? console.log('[lusofonia:debug]', ...args) : undefined);

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, { timeout = 30_000, retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/plain, application/x-mpegURL, */*',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      debug(`tentativa ${attempt + 1} falhou: ${error.message}`);
      if (attempt < retries) await sleep(1_000 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function parseAttributes(raw) {
  const attrs = {};
  const regex = /([\w-]+)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
}

/**
 * Parser M3U tolerante: devolve uma entrada por URL de stream.
 * Suporta #EXTINF, #EXTGRP, #EXTVLCOPT (user-agent, referrer) e comentários.
 */
export function parseM3U(content, country) {
  const lines = content.replace(/\r/g, '').split('\n');
  const entries = [];
  let pending = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTM3U')) {
      pending = null;
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      const commaIndex = line.indexOf(',');
      const meta = commaIndex >= 0 ? line.slice(0, commaIndex) : line;
      const title = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : '';
      const attrs = parseAttributes(meta);
      pending = {
        title,
        tvgId: attrs['tvg-id'] || '',
        tvgName: attrs['tvg-name'] || '',
        logo: attrs['tvg-logo'] || '',
        group: attrs['group-title'] || '',
        country,
        headers: {},
        labels: [],
      };
      continue;
    }

    if (line.startsWith('#EXTGRP:') && pending) {
      pending.group = line.slice(8).trim();
      continue;
    }

    if (line.startsWith('#EXTVLCOPT:') && pending) {
      const option = line.slice(11);
      const eq = option.indexOf('=');
      if (eq > 0) {
        const key = option.slice(0, eq).trim().toLowerCase();
        const value = option.slice(eq + 1).trim();
        if (key.includes('user-agent')) pending.headers['user-agent'] = value;
        else if (key.includes('referrer') || key.includes('referer')) pending.headers.referer = value;
        else if (key.includes('origin')) pending.headers.origin = value;
        else if (key.includes('cookie')) pending.headers.cookie = value;
      }
      continue;
    }

    if (line.startsWith('#')) continue;

    if (!pending) continue;

    // Labels que o iptv-org coloca no título: [Not 24/7], [Geo-blocked], etc.
    const labels = [...pending.title.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
    entries.push({
      ...pending,
      url: line,
      labels,
      quality: (pending.title.match(/\((\d{3,4}p|\d+K)\)/i) || [])[1] || null,
    });
    pending = null;
  }

  return entries;
}

function isIpHost(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
}

function isPrivateHost(hostname) {
  if (hostname === 'localhost') return true;
  if (!isIpHost(hostname)) return false;
  const parts = hostname.split('.').map(Number);
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

function hostAllowed(url, policy) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false;
  if (parsed.protocol === 'http:' && !policy.allowHttp) return false;
  if (isPrivateHost(parsed.hostname)) return false;
  if (isIpHost(parsed.hostname) && !policy.allowIpHost) return false;
  if (!policy.allowThirdPartyGithub && /(^|\.)github\.com$|(^|\.)githubusercontent\.com$/.test(parsed.hostname)) return false;

  return !(policy.denyHosts || []).some((blocked) => parsed.hostname === blocked || parsed.hostname.endsWith(`.${blocked}`));
}

function scoreEntry(entry, channel) {
  let score = 0;
  try {
    const parsed = new URL(entry.url);
    if (parsed.protocol === 'https:') score += 50;
    if (entry.headers['user-agent']) score -= 5;
    if (entry.headers.referer) score -= 10;
  } catch {
    return -Infinity;
  }

  if (!entry.labels.includes('Geo-blocked')) score += 8;
  if (!entry.labels.includes('Not 24/7')) score += 6;
  if (/1080p/i.test(entry.title)) score += 4;
  else if (/720p/i.test(entry.title)) score += 3;
  if (entry.url.includes('token=')) score -= 8;

  // Canais oficiais/FAST costumam estar em CDNs conhecidos.
  const preferred = ['rtp.pt', 'impresa.pt', 'ebc.com.br', 'camara.gov.br', 'cloudfront.net', 'nxplay.com.br', 'akamaized.net', 'sambatech', 'manasat.com', 'streamlock.net', 'jmvstream.com'];
  if (preferred.some((domain) => entry.url.includes(domain))) score += 5;

  if (channel.preferredHosts?.some((host) => entry.url.includes(host))) score += 20;
  return score;
}

async function validateStream(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        ...headers,
        // Alguns servidores só respondem a GET. Lemos apenas o início do manifesto.
        range: 'bytes=0-2048',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();
    const looksLikeHls = /#EXTM3U/i.test(body) || /mpegurl/i.test(contentType) || /application\/vnd\.apple/i.test(contentType);
    if (!looksLikeHls) return { ok: false, reason: `conteúdo inesperado (${contentType || 'sem content-type'})` };

    return { ok: true, status: response.status, contentType };
  } catch (error) {
    return { ok: false, reason: error.name === 'AbortError' ? 'timeout' : error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function readList(country, policy) {
  const fileName = `${country}.m3u`;
  if (STREAMS_DIR) {
    const localPath = path.join(STREAMS_DIR, fileName);
    const content = await fs.readFile(localPath, 'utf8');
    return { url: `file://${localPath}`, content };
  }

  const primary = `${UPSTREAM_BASE}/${fileName}`;
  try {
    return { url: primary, content: await fetchText(primary) };
  } catch (error) {
    log(`  ! ${country}: ${error.message}; a tentar raw.githubusercontent.com`);
    const fallback = `${UPSTREAM_FALLBACK}/${fileName}`;
    return { url: fallback, content: await fetchText(fallback) };
  }
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                    */
/* -------------------------------------------------------------------------- */

async function main() {
  const curation = JSON.parse(await fs.readFile(CURATION_PATH, 'utf8'));
  const policy = {
    allowHttp: false,
    allowIpHost: false,
    allowThirdPartyGithub: false,
    denyHosts: [],
    maxSourcesPerChannel: 2,
    ...(curation.policy || {}),
  };

  const enabled = curation.channels.filter((channel) => channel.enabled !== false);
  const countries = [...new Set(enabled.map((channel) => channel.id.split('.').pop()).filter(Boolean))];

  log(`curadoria: ${enabled.length} canais, países: ${countries.join(', ')}`);
  log(STREAMS_DIR ? `a ler listas locais de ${STREAMS_DIR}` : 'a descarregar listas do iptv-org');

  const lists = new Map();
  const listUrls = {};
  for (const country of countries) {
    try {
      const { url, content } = await readList(country, policy);
      lists.set(country, parseM3U(content, country));
      listUrls[country] = url;
      log(`  ${country}: ${lists.get(country).length} streams`);
    } catch (error) {
      log(`  ! ${country}: falha ao obter lista (${error.message})`);
      lists.set(country, []);
    }
  }
  if ([...lists.values()].every((entries) => entries.length === 0)) {
    throw new Error('Nenhuma lista do iptv-org pôde ser lida. A lista gerada existente foi mantida.');
  }

  const generated = [];
  const report = { skipped: [], noSource: [], invalid: [], duplicates: [] };
  const seenIds = new Set();

  for (const channel of enabled.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))) {
    if (seenIds.has(channel.id)) {
      report.duplicates.push(channel.id);
      continue;
    }
    seenIds.add(channel.id);

    const country = channel.id.split('.').pop()?.toLowerCase();
    const candidates = (lists.get(country) || []).filter((entry) => {
      const baseId = entry.tvgId.split('@')[0];
      return baseId.toLowerCase() === channel.id.toLowerCase();
    });

    // A política global pode ser sobreposta por canal (ex.: permitir HTTP num
    // operador específico). Use com cuidado e documente o motivo no campo notes.
    const channelPolicy = { ...policy, ...(channel.policy || {}) };

    const usable = candidates
      .filter((entry) => hostAllowed(entry.url, channelPolicy))
      .map((entry) => ({ ...entry, score: scoreEntry(entry, channel) }))
      .sort((a, b) => b.score - a.score);

    // Stream manual (URL oficial fora do iptv-org) tem prioridade absoluta.
    const sources = [];
    if (channel.manualUrl) {
      sources.push({
        url: channel.manualUrl,
        headers: {},
        labels: [],
        quality: null,
        origin: 'manual',
        score: 1_000,
      });
    }
    for (const entry of usable) {
      if (sources.some((source) => source.url === entry.url)) continue;
      sources.push({
        url: entry.url,
        headers: entry.headers,
        labels: entry.labels,
        quality: entry.quality,
        origin: 'iptv-org',
        score: entry.score,
      });
      if (sources.length >= (channelPolicy.maxSourcesPerChannel || 2)) break;
    }

    if (sources.length === 0) {
      report.noSource.push(channel.id);
      log(`  - ${channel.id}: sem fonte compatível com a política (${candidates.length} candidatos)`);
      continue;
    }

    const isYoutube = channel.type === 'youtube' || /youtube\.com|youtu\.be/i.test(sources[0].url);
    let status = isYoutube ? 'youtube' : 'unverified';
    let checkedAt = null;

    if (CHECK && !isYoutube) {
      const primary = sources[0];
      const result = await validateStream(primary.url, primary.headers);
      checkedAt = new Date().toISOString();
      if (result.ok) {
        status = 'verified';
      } else {
        status = 'offline';
        report.invalid.push({ id: channel.id, url: primary.url, reason: result.reason });
        log(`  ! ${channel.id}: ${result.reason}`);
        if (STRICT) {
          report.skipped.push(channel.id);
          continue;
        }
      }
      await sleep(150); // cortesia com os servidores
    }

    const tvgId = channel.tvgId || null;
    const epgId = channel.epg === false || !tvgId ? null : tvgId.split('@')[0];

    generated.push({
      id: channel.id,
      tvgId,
      epgId,
      name: channel.name,
      country: channel.country,
      appCategory: channel.appCategory,
      rights: channel.rights || 'review',
      language: 'Português',
      logo: channel.logo || null,
      streamUrl: sources[0].url,
      alternateStreams: sources.slice(1).map((source) => source.url),
      headers: Object.keys(sources[0].headers || {}).length > 0 ? sources[0].headers : undefined,
      labels: sources[0].labels || [],
      quality: sources[0].quality || null,
      status,
      checkedAt,
      notes: channel.notes || null,
    });
  }

  generated.sort((a, b) => {
    const pa = enabled.find((channel) => channel.id === a.id)?.priority ?? 999;
    const pb = enabled.find((channel) => channel.id === b.id)?.priority ?? 999;
    return pa - pb;
  });

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generator: 'scripts/sync-lusofonia.mjs',
    upstream: {
      project: 'iptv-org/iptv',
      lists: listUrls,
    },
    policy,
    stats: {
      curated: enabled.length,
      included: generated.length,
      verified: generated.filter((channel) => channel.status === 'verified').length,
      unverified: generated.filter((channel) => channel.status === 'unverified').length,
      offline: generated.filter((channel) => channel.status === 'offline').length,
      youtube: generated.filter((channel) => channel.status === 'youtube').length,
      noSource: report.noSource.length,
      invalid: report.invalid.length,
      skipped: report.skipped.length,
    },
    report,
    channels: generated,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  log(`gerado ${path.relative(ROOT, OUTPUT_PATH)}: ${generated.length} canais`);
  log(`stats: ${JSON.stringify(output.stats)}`);

  if (output.stats.included === 0) {
    throw new Error('A lista gerada ficou vazia. Verifique a curadoria e as listas de origem.');
  }
}

main().catch((error) => {
  console.error('[lusofonia] erro fatal:', error.message);
  process.exitCode = 1;
});
