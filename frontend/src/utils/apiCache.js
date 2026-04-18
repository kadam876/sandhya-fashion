const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedFetch(url, options = {}) {
  const key = url;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return cached.data;
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export function invalidateCache(urlPattern) {
  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) cache.delete(key);
  }
}
