import Redis, { type RedisOptions } from "ioredis";
import { env } from "../config/env";

const isTls = env.redisUrl.startsWith("rediss://");

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false,
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error("[redis] max retries reached — continuing without Redis");
      return null;
    }
    return Math.min(times * 200, 3000);
  },
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
};

export const redis    = new Redis(env.redisUrl, baseOptions);
export const redisPub = new Redis(env.redisUrl, baseOptions);
export const redisSub = new Redis(env.redisUrl, baseOptions);

redis.on("error",    (err) => console.error("[redis] error",     err.message));
redisPub.on("error", (err) => console.error("[redis:pub] error", err.message));
redisSub.on("error", (err) => console.error("[redis:sub] error", err.message));
redis.on("connect",    () => console.log("[redis] connected"));
redisPub.on("connect", () => console.log("[redis:pub] connected"));
