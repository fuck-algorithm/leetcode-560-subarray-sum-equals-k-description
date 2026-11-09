import { fetchStarCount } from './starCount';

const store = new Map<string, unknown>();
let dbValue: Record<string, unknown> = {};
const transaction = jest.fn(() => ({ objectStore: jest.fn(() => ({ get: (key: string) => { const request: Record<string, unknown> = {}; queueMicrotask(() => { request.result = dbValue[key]; (request.onsuccess as (() => void) | undefined)?.(); }); return request; }, put: (value: unknown, key: string) => { const request: Record<string, unknown> = {}; dbValue[key] = value; queueMicrotask(() => (request.onsuccess as (() => void) | undefined)?.()); return request; } })) }));

beforeEach(() => {
  store.clear();
  dbValue = {};
  Object.defineProperty(window, 'indexedDB', { configurable: true, value: { open: () => { const request: Record<string, unknown> = {}; setTimeout(() => { request.result = { transaction }; (request.onsuccess as (() => void) | undefined)?.(); }, 0); return request; } } });
  global.fetch = jest.fn();
});

afterEach(() => jest.restoreAllMocks());

describe('fetchStarCount', () => {
  it('caches successful values including zero for thirty minutes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 0 }) });
    await expect(fetchStarCount()).resolves.toBe(0);
    await expect(fetchStarCount()).resolves.toBe(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('uses zero for network failure with no cached value and persists retry backoff', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    await expect(fetchStarCount()).resolves.toBe(0);
    await expect(fetchStarCount()).resolves.toBe(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries after backoff when a failed lookup has no cached value', async () => {
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ ok: true, json: async () => ({ stargazers_count: 4 }) });
    await expect(fetchStarCount()).resolves.toBe(0);
    clock.mockReturnValue(2800001);
    await expect(fetchStarCount()).resolves.toBe(4);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    clock.mockRestore();
  });

  it('falls back to stale cached stars and backs off after failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ stargazers_count: 23 }) }).mockRejectedValueOnce(new Error('offline'));
    await expect(fetchStarCount()).resolves.toBe(23);
    dbValue['fuck-algorithm/leetcode-560-subarray-sum-equals-k-description'] = { stars: 23, expiresAt: 0, retryAfter: 0 };
    await expect(fetchStarCount()).resolves.toBe(23);
    await expect(fetchStarCount()).resolves.toBe(23);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
