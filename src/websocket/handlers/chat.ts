import { Server } from "socket.io";
import { AuthedSocket } from "../io";
import { prisma } from "../../services/prisma";

export function registerChatHandlers(io: Server, socket: AuthedSocket): void {
  socket.on("chat:send", async (payload: { receiverId: string; message: string; type?: string; metadata?: any }, ack?: (res: any) => void) => {
    if (!payload?.receiverId || !payload?.message) {
      ack?.({ ok: false, error: "invalid_payload" });
      return;
    }
    try {
      const created = await prisma.message.create({
        data: {
          senderId: socket.userId,
          receiverId: payload.receiverId,
          message: String(payload.message).slice(0, 4000),
          type: payload.type ?? "text",
          metadata: payload.metadata ?? undefined,
        },
      });
      const event = { ...created };
      io.to(`user:${payload.receiverId}`).emit("chat:new", event);
      socket.emit("chat:new", event);
      ack?.({ ok: true, message: created });
    } catch (err) {
      console.error("[ws] chat:send error", err);
      ack?.({ ok: false, error: "send_failed" });
    }
  });

  socket.on("chat:typing", (payload: { receiverId: string; typing: boolean }) => {
    if (!payload?.receiverId) return;
    io.to(`user:${payload.receiverId}`).emit("chat:typing", {
      from: socket.userId,
      typing: Boolean(payload.typing),
    });
  });

  socket.on("chat:nudge", (payload: { receiverId: string }) => {
    if (!payload?.receiverId) return;
    io.to(`user:${payload.receiverId}`).emit("chat:nudge", { from: socket.userId, at: Date.now() });
  });

  socket.on("chat:read", async (payload: { peerId: string }) => {
    if (!payload?.peerId) return;
    await prisma.message.updateMany({
      where: { senderId: payload.peerId, receiverId: socket.userId, readAt: null },
      data: { readAt: new Date() },
    });
    io.to(`user:${payload.peerId}`).emit("chat:read", { by: socket.userId });
  });
}
