import { Server } from "socket.io";
import { AuthedSocket } from "../io";
import { prisma } from "../../services/prisma";

// ── Helper: find or create 1:1 conversation ──────────────────────────────────
async function getOrCreate1to1(userAId: string, userBId: string): Promise<string> {
  const candidates = await prisma.conversation.findMany({
    where: { participants: { some: { userId: userAId } } },
    include: { participants: true },
  });
  const existing = candidates.find(
    (c) =>
      c.participants.length === 2 &&
      c.participants.some((p) => p.userId === userBId)
  );
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: userAId }, { userId: userBId }] },
    },
  });
  return created.id;
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export function registerChatHandlers(io: Server, socket: AuthedSocket): void {
  socket.on(
    "chat:send",
    async (
      payload: { receiverId: string; content: string; messageType?: string },
      ack?: (res: any) => void
    ) => {
      if (!payload?.receiverId || !payload?.content) {
        ack?.({ ok: false, error: "invalid_payload" });
        return;
      }
      try {
        const convId = await getOrCreate1to1(socket.userId, payload.receiverId);

        const created = await prisma.message.create({
          data: {
            conversationId: convId,
            senderId: socket.userId,
            content: String(payload.content).slice(0, 4000),
            messageType: payload.messageType ?? "text",
          },
          include: {
            sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        });

        await prisma.conversation.update({
          where: { id: convId },
          data: { updatedAt: new Date() },
        });

        const event = { ...created, conversationId: convId, receiverId: payload.receiverId };
        io.to(`user:${payload.receiverId}`).emit("chat:new", event);
        socket.emit("chat:new", event);
        ack?.({ ok: true, message: created, conversationId: convId });
      } catch (err) {
        console.error("[ws] chat:send error", err);
        ack?.({ ok: false, error: "send_failed" });
      }
    }
  );

  socket.on("chat:typing", (payload: { receiverId: string; typing: boolean }) => {
    if (!payload?.receiverId) return;
    io.to(`user:${payload.receiverId}`).emit("chat:typing", {
      from: socket.userId,
      typing: Boolean(payload.typing),
    });
  });

  socket.on("chat:nudge", (payload: { receiverId: string }) => {
    if (!payload?.receiverId) return;
    io.to(`user:${payload.receiverId}`).emit("chat:nudge", {
      from: socket.userId,
      at: Date.now(),
    });
  });
}
