import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { prisma } from "../services/prisma";

export async function getConversation(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const otherId = req.params.userId;
  const limit = Math.min(Number(req.query.limit ?? 100), 200);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.id, receiverId: otherId },
        { senderId: otherId, receiverId: req.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  res.json({ messages: messages.reverse() });
}

export async function listConversations(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const userId = req.user.id;
  // Last message per peer
  const rows = await prisma.$queryRawUnsafe<Array<{ peer: string; last: string }>>(
    `
    SELECT peer, MAX(created_at) as last FROM (
      SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as peer, created_at
      FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
    ) t
    GROUP BY peer
    ORDER BY last DESC
    LIMIT 50
    `,
    userId
  );
  res.json({ conversations: rows });
}

export async function sendMessage(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    receiverId: z.string().uuid(),
    message: z.string().min(1).max(4000),
    type: z.enum(["text", "nudge", "sticker", "spotify"]).default("text"),
    metadata: z.record(z.any()).optional(),
  });
  const data = schema.parse(req.body);
  const created = await prisma.message.create({
    data: {
      senderId: req.user.id,
      receiverId: data.receiverId,
      message: data.message,
      type: data.type,
      metadata: data.metadata ?? undefined,
    },
  });
  res.status(201).json({ message: created });
}

export async function markRead(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const otherId = req.params.userId;
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: req.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true });
}
