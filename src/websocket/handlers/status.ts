import { Server } from "socket.io";
import { AuthedSocket } from "../io";
import { prisma } from "../../services/prisma";
import { updateStatus } from "../../services/presence";

const ALLOWED = ["online", "away", "dnd", "invisible", "offline"] as const;

export function registerStatusHandlers(io: Server, socket: AuthedSocket): void {
  socket.on(
    "status:update",
    async (
      payload: { status?: string; customStatus?: string | null },
      ack?: (res: any) => void
    ) => {
      const next = ALLOWED.includes((payload?.status ?? "online") as any)
        ? (payload!.status as (typeof ALLOWED)[number])
        : "online";
      const customStatus = payload?.customStatus ?? null;

      try {
        const updated = await prisma.userStatus.upsert({
          where: { userId: socket.userId },
          create: { userId: socket.userId, status: next, customStatus },
          update: { status: next, customStatus },
        });
        await updateStatus(socket.userId, next as any, customStatus ?? undefined);
        io.emit("status:update", {
          userId: socket.userId,
          status: updated.status,
          customStatus: updated.customStatus,
        });
        ack?.({ ok: true, status: updated });
      } catch (err) {
        console.error("[ws] status:update error", err);
        ack?.({ ok: false });
      }
    }
  );
}
