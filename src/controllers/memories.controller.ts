import { Response } from "express";
import { type AuthedRequest } from "../middleware/auth";
import { prisma } from "../services/prisma";
import { HttpError } from "../utils/errors";

export async function listMemories(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const sessions = await prisma.nostalgiaSession.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      eraId: true,
      mood: true,
      aiSuggestion: true,
      createdAt: true,
    },
  });
  res.json({ memories: sessions });
}

export async function createMemory(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const { eraId, mood, aiSuggestion } = req.body as {
    eraId: string;
    mood?: string;
    aiSuggestion?: string;
  };
  if (!eraId) throw new HttpError(400, "eraId required");
  const session = await prisma.nostalgiaSession.create({
    data: { userId: req.user.id, eraId, mood, aiSuggestion },
  });
  res.status(201).json({ memory: session });
}
