/**
 * Cache local do XMLTV em IndexedDB.
 *
 * - TTL curto para refresh (6h por omissão).
 * - Se a rede falhar, devolve a cópia em cache mesmo que já esteja "velha"
 *   (stale-while-revalidate offline).
 * - Sem IndexedDB (modo privado antigo), funciona só em memória.
 */

const DB_NAME = 'teip-epg';
const DB_VERSION = 1;
const STORE = 'guides';

export interface CachedGuide {
  url: string;
  xml: string;
  fetchedAt: number;
  etag?: string;
}

interface CacheResult extends CachedGuide {
  fromCache: boolean;
  stale: boolean;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;
const memoryCache = new Map<string, CachedGuide>();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'url' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

async function idbGet(url: string): Promise<CachedGuide | null> {
  const db = await openDb();
  if (!db) return memoryCache.get(url) || null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readonly');
      const request = transaction.objectStore(STORE).get(url);
      request.onsuccess = () => resolve((request.result as CachedGuide) || null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(memoryCache.get(url) || null);
    }
  });
}

async function idbPut(entry: CachedGuide): Promise<void> {
  memoryCache.set(entry.url, entry);
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbClear(): Promise<void> {
  memoryCache.clear();
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function decodeResponse(response: Response, url: string): Promise<string> {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // .gz servido como ficheiro estático (sem Content-Encoding) tem magic 1f 8b.
  const isGzip = bytes.length > 1 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (isGzip) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('O ficheiro EPG está comprimido em gzip e este browser não suporta DecompressionStream.');
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const decompressed = await new Response(stream).arrayBuffer();
    return new TextDecoder('utf-8').decode(decompressed);
  }

  const contentType = response.headers.get('content-type') || '';
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 200));
  const declaresLatin1 = /encoding=["'](iso-8859-1|windows-1252|latin1)/i.test(head);
  const charset = /charset=([\w-]+)/i.exec(contentType)?.[1];
  const encoding = charset || (declaresLatin1 ? 'windows-1252' : 'utf-8');

  try {
    return new TextDecoder(encoding).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

export interface FetchGuideOptions {
  /** Ignora a cache e força um pedido de rede. */
  force?: boolean;
  /** Idade máxima da cache "fresca", em horas. */
  refreshHours?: number;
  /** Idade máxima aceitável de cache antiga em caso de falha de rede. */
  maxStaleHours?: number;
  timeoutMs?: number;
}

export async function getGuideXml(url: string, options: FetchGuideOptions = {}): Promise<CacheResult> {
  const refreshMs = (options.refreshHours ?? 6) * 60 * 60 * 1000;
  const maxStaleMs = (options.maxStaleHours ?? 168) * 60 * 60 * 1000;
  const now = Date.now();

  const cached = await idbGet(url);
  if (!options.force && cached && now - cached.fetchedAt < refreshMs) {
    return { ...cached, fromCache: true, stale: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/xml, text/xml, application/gzip, */*' },
      cache: options.force ? 'no-store' : 'default',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} em ${new URL(url, location.href).pathname}`);

    const xml = await decodeResponse(response, url);
    if (!xml.includes('<tv')) throw new Error('A resposta não parece ser um ficheiro XMLTV.');

    const entry: CachedGuide = {
      url,
      xml,
      fetchedAt: Date.now(),
      etag: response.headers.get('etag') || undefined,
    };
    await idbPut(entry);
    return { ...entry, fromCache: false, stale: false };
  } catch (error) {
    if (cached && now - cached.fetchedAt < maxStaleMs) {
      return { ...cached, fromCache: true, stale: true };
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function clearEpgCache(): Promise<void> {
  await idbClear();
}
