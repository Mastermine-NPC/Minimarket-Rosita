export interface NoticePreferences { initialized: boolean; seen: string[]; read: string[]; browser: boolean }
const EMPTY: NoticePreferences = { initialized: false, seen: [], read: [], browser: false };
const prefix = "minimarket-rosita:order-notices:";
const cache = new Map<string, NoticePreferences>();
const listeners = new Set<() => void>();
export const subscribeNotices = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function readNoticePreferences(userId: string, fresh = false): NoticePreferences {
  if (!userId) return EMPTY;
  if (!fresh && cache.has(userId)) return cache.get(userId)!;
  let value = cache.get(userId) || EMPTY;
  try {
    const raw = localStorage.getItem(prefix + userId);
    if (raw) {
      const data = JSON.parse(raw);
      value = { initialized: data.initialized === true, seen: Array.isArray(data.seen) ? data.seen.filter((s: unknown) => typeof s === "string") : [], read: Array.isArray(data.read) ? data.read.filter((s: unknown) => typeof s === "string") : [], browser: data.browser === true };
    } else value = EMPTY;
  } catch { /* Preferences remain usable in memory if storage is blocked. */ }
  cache.set(userId, value); return value;
}
export function saveNoticePreferences(userId: string, value: NoticePreferences) {
  if (!userId) return;
  const previous = cache.get(userId);
  if (previous && JSON.stringify(previous) === JSON.stringify(value)) return;
  cache.set(userId, value);
  try { localStorage.setItem(prefix + userId, JSON.stringify(value)); } catch { /* The page already reports unavailable storage. */ }
  for (const listener of listeners) listener();
}
export function receiveNoticePreferences(event: StorageEvent) {
  if (!event.key?.startsWith(prefix)) return;
  const userId = event.key.slice(prefix.length);
  cache.delete(userId); readNoticePreferences(userId, true);
  for (const listener of listeners) listener();
}
