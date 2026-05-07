import { redis } from "./redis";

const PRESENCE_KEY = (userId: string) => `presence:user:${userId}`;
const PRESENCE_SOCKETS = (userId: string) => `presence:sockets:${userId}`;
const ONLINE_SET = "presence:online";
const TTL_SECONDS = 60 * 5; // 5 min refresh

export interface PresenceState {
  userId: string;
  status: "online" | "away" | "dnd" | "invisible" | "offline";
  customStatus?: string;
  lastSeen?: string;
}

export async function setOnline(userId: string, socketId: string): Promise<void> {
  await redis.sadd(PRESENCE_SOCKETS(userId), socketId);
  await redis.sadd(ONLINE_SET, userId);
  await redis.set(PRESENCE_KEY(userId), JSON.stringify({ userId, status: "online" }), "EX", TTL_SECONDS);
}

export async function removeSocket(userId: string, socketId: string): Promise<boolean> {
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
    return true; // realmente offline
  }
  return false;
}

export async function getPresence(userId: string): Promise<PresenceState> {
  const raw = await redis.get(PRESENCE_KEY(userId));
  if (!raw) return { userId, status: "offline" };
  try {
    return JSON.parse(raw) as PresenceState;
  } catch {
    return { userId, status: "offline" };
  }
}

export async function getOnlineUserIds(): Promise<string[]> {
  return redis.smembers(ONLINE_SET);
}

export async function updateStatus(userId: string, status: PresenceState["status"], customStatus?: string): Promise<void> {
  const payload: PresenceState = { userId, status, customStatus };
  await redis.set(PRESENCE_KEY(userId), JSON.stringify(payload), "EX", TTL_SECONDS);
}
