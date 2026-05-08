import { redis } from "./redis";

export interface PresenceState {
  userId: string;
  status: "online" | "away" | "dnd" | "invisible" | "offline";
  customStatus?: string;
  lastSeen?: string;
}

// ── In-memory fallback (used when Redis is not configured) ──────────────────
const memSockets  = new Map<string, Set<string>>();
const memOnline   = new Set<string>();
const memPresence = new Map<string, PresenceState>();

// ── Redis key helpers ────────────────────────────────────────────────────────
const PRESENCE_KEY    = (userId: string) => `presence:user:${userId}`;
const PRESENCE_SOCKETS = (userId: string) => `presence:sockets:${userId}`;
const ONLINE_SET = "presence:online";
const TTL = 60 * 5;

// ── Public API ───────────────────────────────────────────────────────────────

export async function setOnline(userId: string, socketId: string): Promise<void> {
  if (redis) {
    await redis.sadd(PRESENCE_SOCKETS(userId), socketId);
    await redis.sadd(ONLINE_SET, userId);
    await redis.set(PRESENCE_KEY(userId), JSON.stringify({ userId, status: "online" }), "EX", TTL);
  } else {
    if (!memSockets.has(userId)) memSockets.set(userId, new Set());
    memSockets.get(userId)!.add(socketId);
    memOnline.add(userId);
    memPresence.set(userId, { userId, status: "online" });
  }
}

export async function removeSocket(userId: string, socketId: string): Promise<boolean> {
  if (redis) {
    await redis.srem(PRESENCE_SOCKETS(userId), socketId);
    const remaining = await redis.scard(PRESENCE_SOCKETS(userId));
    if (remaining === 0) {
      await redis.srem(ONLINE_SET, userId);
      await redis.set(
        PRESENCE_KEY(userId),
        JSON.stringify({ userId, status: "offline", lastSeen: new Date().toISOString() }),
        "EX",
        60 * 60 * 24
      );
      return true;
    }
    return false;
  } else {
    const sockets = memSockets.get(userId);
    sockets?.delete(socketId);
    if (!sockets || sockets.size === 0) {
      memOnline.delete(userId);
      memPresence.set(userId, { userId, status: "offline", lastSeen: new Date().toISOString() });
      return true;
    }
    return false;
  }
}

export async function getPresence(userId: string): Promise<PresenceState> {
  if (redis) {
    const raw = await redis.get(PRESENCE_KEY(userId));
    if (!raw) return { userId, status: "offline" };
    try { return JSON.parse(raw) as PresenceState; } catch { return { userId, status: "offline" }; }
  } else {
    return memPresence.get(userId) ?? { userId, status: "offline" };
  }
}

export async function getOnlineUserIds(): Promise<string[]> {
  if (redis) return redis.smembers(ONLINE_SET);
  return Array.from(memOnline);
}

export async function updateStatus(userId: string, status: PresenceState["status"], customStatus?: string): Promise<void> {
  const payload: PresenceState = { userId, status, customStatus };
  if (redis) {
    await redis.set(PRESENCE_KEY(userId), JSON.stringify(payload), "EX", TTL);
  } else {
    memPresence.set(userId, payload);
  }
}
