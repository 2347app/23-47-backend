import Redis, { type RedisOptions } from "ioredis";
import { env } from "../config/env";

function makeClient(url: string): Redis {
  const isTls = url.startsWith("rediss://");
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy: (times: number) => {
      if (times > 6) return null;
      return Math.min(times * 300, 3000);
    },
    ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  };
  return new Redis(url, options);
}

export let redis:    Redis | null = null;
export let redisPub: Redis | null = null;
export let redisSub: Redis | null = null;
export let redisAvailable = false;

if (env.redisUrl) {
  redis    = makeClient(env.redisUrl);
  redisPub = makeClient(env.redisUrl);
  redisSub = makeClient(env.redisUrl);
  redisAvailable = true;

  redis.on("error",    (err) => console.error("[redis] error",     err.message));
  redisPub.on("error", (err) => console.error("[redis:pub] error", err.message));
  redisSub.on("error", (err) => console.error("[redis:sub] error", err.message));
  redis.on("connect",    () => console.log("[redis] connected"));
  redisPub.on("connect", () => console.log("[redis:pub] connected"));
} else {
  console.log("[redis] disabled — using local memory fallback");
}
