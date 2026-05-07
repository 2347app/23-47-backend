import Redis from "ioredis";
import { env } from "../config/env";

const baseOptions = {
  maxRetriesPerRequest: null as null,
  enableReadyCheck: true,
  lazyConnect: false,
};

export const redis = new Redis(env.redisUrl, baseOptions);
export const redisPub = new Redis(env.redisUrl, baseOptions);
export const redisSub = new Redis(env.redisUrl, baseOptions);

redis.on("error", (err) => console.error("[redis] error", err.message));
redisPub.on("error", (err) => console.error("[redis:pub] error", err.message));
redisSub.on("error", (err) => console.error("[redis:sub] error", err.message));
