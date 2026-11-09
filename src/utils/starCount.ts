const DB_NAME = 'leetcode-560-cache';
const STORE = 'github-stars';
const KEY = 'fuck-algorithm/leetcode-560-subarray-sum-equals-k-description';
const TTL = 1800000;

type Cached = { stars?: number; expiresAt: number; retryAfter: number };
let memoryCache: Cached | undefined;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCache(): Promise<Cached | undefined> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(request.result as Cached | undefined);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return memoryCache;
  }
}

async function writeCache(value: Cached): Promise<void> {
  memoryCache = value;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch { /* Memory cache remains available. */ }
}

export async function fetchStarCount(signal?: AbortSignal): Promise<number> {
  const cached = await readCache();
  const now = Date.now();
  if (cached?.stars !== undefined && cached.expiresAt > now) return cached.stars;
  if (cached && cached.retryAfter > now) return cached.stars ?? 0;
  try {
    const response = await fetch('https://api.github.com/repos/fuck-algorithm/leetcode-560-subarray-sum-equals-k-description', { signal, headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const data = await response.json() as { stargazers_count?: number };
    const stars = Number.isFinite(data.stargazers_count) ? Math.max(0, Number(data.stargazers_count)) : 0;
    await writeCache({ stars, expiresAt: now + TTL, retryAfter: 0 });
    return stars;
  } catch {
    await writeCache({ stars: cached?.stars, expiresAt: cached?.expiresAt ?? 0, retryAfter: now + TTL });
    return cached?.stars ?? 0;
  }
}
