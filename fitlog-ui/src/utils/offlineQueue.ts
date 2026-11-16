import { sessionsApi, type SaveSessionRequest } from '../services/trackingService';

/**
 * Sessions finished without a connection (common in gym basements) are kept on the
 * device and sent when the browser is back online or the app starts again.
 */
const key = (userId: string) => `pendingSessions_${userId}`;

export function queueSession(userId: string, session: SaveSessionRequest) {
  const list: SaveSessionRequest[] = readQueue(userId);
  list.push(session);
  localStorage.setItem(key(userId), JSON.stringify(list));
}

export function readQueue(userId: string): SaveSessionRequest[] {
  try {
    const v = JSON.parse(localStorage.getItem(key(userId)) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

let flushing = false;

/** Sends queued sessions; keeps the ones that still fail. Returns how many were sent. */
export async function flushQueue(userId: string): Promise<number> {
  if (flushing || !navigator.onLine) return 0;
  flushing = true;
  let sent = 0;
  try {
    const remaining: SaveSessionRequest[] = [];
    for (const s of readQueue(userId)) {
      try {
        await sessionsApi.create(s);
        sent++;
      } catch (err) {
        // 4xx = invalid data: drop it so it doesn't block the queue forever
        const status = (err as { response?: { status?: number } }).response?.status;
        if (!status || status >= 500 || status === 401) remaining.push(s);
      }
    }
    if (remaining.length) localStorage.setItem(key(userId), JSON.stringify(remaining));
    else localStorage.removeItem(key(userId));
  } finally {
    flushing = false;
  }
  return sent;
}

/** True when the request failed because there is no connection (no HTTP response at all). */
export const isNetworkError = (err: unknown) => !(err as { response?: unknown }).response;
