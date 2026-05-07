import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { prisma } from "../services/prisma";
import { getPresence } from "../services/presence";

const updateSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  theme: z.string().optional(),
  currentMood: z.string().max(40).optional().nullable(),
});

export async function updateMe(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const data = updateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    include: { status: true, digitalRoom: true },
  });
  res.json({ user: sanitize(user) });
}

export async function searchUsers(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) {
    res.json({ users: [] });
    return;
  }
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: req.user.id } },
        {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 20,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      currentMood: true,
    },
  });
  res.json({ users });
}

export async function getUserById(req: AuthedRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { status: true, digitalRoom: { include: { items: true } } },
  });
  if (!user) throw new HttpError(404, "user_not_found");
  const presence = await getPresence(user.id);
  res.json({ user: { ...sanitize(user), presence } });
}

function sanitize(user: any) {
  const { passwordHash, spotifyAccessToken, spotifyRefreshToken, ...rest } = user;
  return { ...rest, spotifyConnected: Boolean(spotifyAccessToken) };
}
