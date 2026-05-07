import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisPub, redisSub } from "../services/redis";
import { env } from "../config/env";
import { verifyAccessToken } from "../services/jwt";
import { registerChatHandlers } from "./handlers/chat";
import { registerPresenceHandlers } from "./handlers/presence";
import { registerStatusHandlers } from "./handlers/status";
import { registerEraHandlers } from "./handlers/era";
import { setOnline, removeSocket } from "../services/presence";

export interface AuthedSocket extends Socket {
  userId: string;
  username: string;
}

export function createIo(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.adapter(createAdapter(redisPub, redisSub));

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
    await setOnline(socket.userId, socket.id);
    await socket.join(`user:${socket.userId}`);

    // Notify friends
    socket.broadcast.emit("presence:online", { userId: socket.userId });
    socket.emit("session:ready", { userId: socket.userId });

    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerStatusHandlers(io, socket);
    registerEraHandlers(io, socket);

    socket.on("disconnect", async () => {
      const isOffline = await removeSocket(socket.userId, socket.id);
      if (isOffline) {
        io.emit("presence:offline", { userId: socket.userId });
      }
    });
  });

  return io;
}
