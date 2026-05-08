import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { prisma } from "../services/prisma";

// ── Helper: find or create 1:1 conversation ──────────────────────────────────
async function getOrCreate1to1(userAId: string, userBId: string): Promise<string> {
  const candidates = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: userAId } },
    },
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
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
  });
  return created.id;
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function getConversation(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const peerId = req.params.userId;
  const limit = Math.min(Number(req.query.limit ?? 100), 200);

  const convId = await getOrCreate1to1(req.user.id, peerId);

  const messages = await prisma.message.findMany({
    where: { conversationId: convId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });
  res.json({ conversationId: convId, messages });
}

export async function listConversations(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: req.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
    take: 50,
  });

  const conversations = participations.map((p) => ({
    ...p.conversation,
    peer: p.conversation.participants.find((x) => x.userId !== req.user!.id)?.user ?? null,
  }));

  res.json({ conversations });
}

export async function sendMessage(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(4000),
    messageType: z.enum(["text", "nudge", "spotify"]).default("text"),
  });
  const data = schema.parse(req.body);

  const convId = await getOrCreate1to1(req.user.id, data.receiverId);

  const created = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: req.user.id,
      content: data.content,
      messageType: data.messageType,
    },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: convId },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({ message: created, conversationId: convId });
}

export async function deleteMessage(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const msgId = req.params.messageId;

  const msg = await prisma.message.findUnique({ where: { id: msgId } });
  if (!msg || msg.senderId !== req.user.id) throw new HttpError(404, "message_not_found");

  await prisma.message.update({
    where: { id: msgId },
    data: { deletedAt: new Date() },
  });
  res.json({ ok: true });
}
