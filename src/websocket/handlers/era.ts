import { Server } from "socket.io";
import { AuthedSocket, emitToFriends } from "../io";
import { prisma } from "../../services/prisma";
import { findEra } from "../../config/eras";

export function registerEraHandlers(io: Server, socket: AuthedSocket): void {
  socket.on("era:change", async (payload: { era: string; mood?: string }, ack?: (res: any) => void) => {
    const era = findEra(payload?.era ?? "");
    if (!era) {
      ack?.({ ok: false, error: "era_not_found" });
      return;
    }
    try {
      await prisma.$transaction([
        prisma.user.update({ where: { id: socket.userId }, data: { theme: era.id } }),
        prisma.nostalgiaSession.create({
          data: { userId: socket.userId, era: era.id, mood: payload.mood ?? null },
        }),
      ]);
      const eraEvent = { userId: socket.userId, era: era.id };
      socket.emit("era:change", eraEvent);
      await emitToFriends(io, socket.userId, "era:change", eraEvent);
      ack?.({ ok: true, era });
    } catch (err) {
      console.error("[ws] era:change error", err);
      ack?.({ ok: false });
    }
  });
}
