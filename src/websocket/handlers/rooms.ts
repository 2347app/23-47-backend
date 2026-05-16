import type { Server } from "socket.io";
import type { AuthedSocket } from "../io";
import { prisma } from "../../services/prisma";

const ATMOSPHERIC_ROOMS = [
  { slug: "verano-2003",           title: "Verano de 2003",           atmosphereType: "warm"       },
  { slug: "madrugada-2004",        title: "Madrugada de 2004",        atmosphereType: "calm"       },
  { slug: "lluvia-2005",           title: "Lluvia de 2005",           atmosphereType: "rain"       },
  { slug: "verano-social-2006",    title: "Verano Social 2006",       atmosphereType: "social"     },
  { slug: "noche-melancolica-2007",title: "Noche Melancólica de 2007",atmosphereType: "melancholic" },
];

async function ensureRoom(slug: string) {
  const preset = ATMOSPHERIC_ROOMS.find((r) => r.slug === slug);
  if (!preset) return null;
  return prisma.room.upsert({
    where: { slug },
    update: {},
    create: { slug, title: preset.title, atmosphereType: preset.atmosphereType },
  });
}

export function registerRoomHandlers(io: Server, socket: AuthedSocket) {
  socket.on(
    "room:join",
    async ({ slug }: { slug: string }, ack?: (res: { ok: boolean; error?: string }) => void) => {
      try {
        const room = await ensureRoom(slug);
        if (!room) { ack?.({ ok: false, error: "unknown_room" }); return; }

        // Leave any previous room sockets
        const prevRooms = [...socket.rooms].filter((r) => r.startsWith("room:"));
        for (const r of prevRooms) {
          socket.leave(r);
          io.to(r).emit("room:presence", {
            type: "leave",
            userId: socket.userId,
            username: socket.username,
            slug: r.replace("room:", ""),
          });
        }

        await socket.join(`room:${slug}`);
        io.to(`room:${slug}`).emit("room:presence", {
          type: "join",
          userId: socket.userId,
          username: socket.username,
          slug,
        });

        const sockets = await io.in(`room:${slug}`).fetchSockets();
        const members = sockets.map((s) => ({
          userId: (s as any).userId as string,
          username: (s as any).username as string,
        }));
        socket.emit("room:members", { slug, members });
        ack?.({ ok: true });
      } catch (err) {
        console.error("[ws] room:join", err);
        ack?.({ ok: false, error: "join_failed" });
      }
    }
  );

  socket.on(
    "room:chat",
    ({ slug, content }: { slug: string; content: string }) => {
      if (!content?.trim() || !slug) return;
      if (!socket.rooms.has(`room:${slug}`)) return;
      io.to(`room:${slug}`).emit("room:chat", {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fromUserId: socket.userId,
        fromUsername: socket.username,
        content: content.trim(),
        at: Date.now(),
      });
    }
  );

  socket.on(
    "rooms:sync",
    async (_: unknown, ack?: (res: Record<string, { userId: string; username: string }[]>) => void) => {
      const result: Record<string, { userId: string; username: string }[]> = {};
      for (const room of ATMOSPHERIC_ROOMS) {
        const sockets = await io.in(`room:${room.slug}`).fetchSockets();
        result[room.slug] = sockets.map((s) => ({
          userId: (s as any).userId as string,
          username: (s as any).username as string,
        }));
      }
      ack?.(result);
    }
  );

  socket.on("room:leave", ({ slug }: { slug: string }) => {
    socket.leave(`room:${slug}`);
    io.to(`room:${slug}`).emit("room:presence", {
      type: "leave",
      userId: socket.userId,
      username: socket.username,
      slug,
    });
  });

  socket.on("disconnect", () => {
    [...socket.rooms]
      .filter((r) => r.startsWith("room:"))
      .forEach((r) => {
        io.to(r).emit("room:presence", {
          type: "leave",
          userId: socket.userId,
          username: socket.username,
          slug: r.replace("room:", ""),
        });
      });
  });
}
