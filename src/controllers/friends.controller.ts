import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { prisma } from "../services/prisma";
import { getPresence } from "../services/presence";

export async function listFriends(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const friends = await prisma.friend.findMany({
    where: { userId: req.user.id, status: "accepted" },
    include: {
      friend: {
        include: { status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const enriched = await Promise.all(
    friends.map(async (f) => ({
      id: f.id,
      since: f.createdAt,
      user: {
        id: f.friend.id,
        username: f.friend.username,
        displayName: f.friend.displayName,
        avatarUrl: f.friend.avatarUrl,
        bio: f.friend.bio,
        currentMood: f.friend.currentMood,
        theme: f.friend.theme,
        status: f.friend.status,
        presence: await getPresence(f.friend.id),
      },
    }))
  );
  res.json({ friends: enriched });
}

export async function addFriend(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({ friendId: z.string().uuid() });
  const { friendId } = schema.parse(req.body);
  if (friendId === req.user.id) throw new HttpError(400, "cannot_friend_yourself");
  const target = await prisma.user.findUnique({ where: { id: friendId } });
  if (!target) throw new HttpError(404, "user_not_found");

  // Bidireccional aceptado por simplicidad (autodescubrimiento + aceptación inmediata).
  await prisma.$transaction([
    prisma.friend.upsert({
      where: { userId_friendId: { userId: req.user.id, friendId } },
      create: { userId: req.user.id, friendId, status: "accepted" },
      update: { status: "accepted" },
    }),
    prisma.friend.upsert({
      where: { userId_friendId: { userId: friendId, friendId: req.user.id } },
      create: { userId: friendId, friendId: req.user.id, status: "accepted" },
      update: { status: "accepted" },
    }),
  ]);
  res.status(201).json({ ok: true });
}

export async function removeFriend(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const friendId = req.params.id;
  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId: req.user.id, friendId },
        { userId: friendId, friendId: req.user.id },
      ],
    },
  });
  res.json({ ok: true });
}
