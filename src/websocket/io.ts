import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisPub, redisSub, redisAvailable } from "../services/redis";
import { env } from "../config/env";
import { verifyAccessToken } from "../services/jwt";
import { registerChatHandlers } from "./handlers/chat";
import { registerPresenceHandlers } from "./handlers/presence";
import { registerStatusHandlers } from "./handlers/status";
import { registerEraHandlers } from "./handlers/era";
import { registerRoomHandlers } from "./handlers/rooms";
import { setOnline, removeSocket } from "../services/presence";
import { prisma } from "../services/prisma";

export interface AuthedSocket extends Socket {
  userId: string;
  username: string;
}

// ── Helper: broadcast to each accepted friend's user room ───────────────────
export async function emitToFriends(
  io: Server,
  userId: string,
  event: string,
  payload: unknown
): Promise<void> {
  const friends = await prisma.friend.findMany({
    where: { userId, status: "accepted" },
    select: { friendId: true },
  });
  for (const { friendId } of friends) {
    io.to(`user:${friendId}`).emit(event, payload);
  }
}

export function createIo(httpServer: HttpServer): Server {
  const allowedOrigins = env.frontendUrl
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  console.log("[ws] allowed origins:", allowedOrigins);

  if (env.nodeEnv === "production" && allowedOrigins.every((o) => o.includes("localhost"))) {
    console.warn("[ws] WARNING: FRONTEND_URL contains only localhost origins in production — WebSocket connections from the real frontend will be rejected. Set FRONTEND_URL correctly in Railway.");
  }

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else {
          console.warn(`[ws] CORS blocked origin: ${origin}`);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  if (redisAvailable && redisPub && redisSub) {
    io.adapter(createAdapter(redisPub, redisSub));
    console.log("[ws] Redis adapter enabled");
  } else {
    console.log("[ws] Redis not available — using in-memory adapter (single instance)");
  }

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      (socket.handshake.query?.token as string | undefined);
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      (socket as AuthedSocket).userId = payload.sub;
      (socket as AuthedSocket).username = payload.username;
      next();
    } catch {
      next(new Error("invalid_token"));
    }
  });

  io.on("connection", async (rawSocket) => {
    const socket = rawSocket as AuthedSocket;
    console.log(`[ws] connected   uid=${socket.userId} sid=${socket.id} transport=${socket.conn.transport.name}`);

    await setOnline(socket.userId, socket.id);
    await socket.join(`user:${socket.userId}`);

    // Notify only friends that this user came online
    await emitToFriends(io, socket.userId, "presence:online", { userId: socket.userId });
    socket.emit("session:ready", { userId: socket.userId });

    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerStatusHandlers(io, socket);
    registerEraHandlers(io, socket);
    registerRoomHandlers(io, socket);

    socket.on("disconnect", async (reason) => {
      console.log(`[ws] disconnected uid=${socket.userId} sid=${socket.id} reason=${reason}`);
      const isOffline = await removeSocket(socket.userId, socket.id);
      if (isOffline) {
        await emitToFriends(io, socket.userId, "presence:offline", { userId: socket.userId });
      }
    });
  });

  return io;
}
