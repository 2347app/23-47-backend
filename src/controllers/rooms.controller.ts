import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { prisma } from "../services/prisma";

export async function getMyRoom(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  let room = await prisma.digitalRoom.findUnique({
    where: { userId: req.user.id },
    include: { items: true },
  });
  if (!room) {
    room = await prisma.digitalRoom.create({
      data: { userId: req.user.id, theme: "madrugada-2003" },
      include: { items: true },
    });
  }
  res.json({ room });
}

export async function getRoomByUser(req: AuthedRequest, res: Response): Promise<void> {
  const userId = req.params.userId;
  const room = await prisma.digitalRoom.findUnique({
    where: { userId },
    include: { items: true, user: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  if (!room) throw new HttpError(404, "room_not_found");
  res.json({ room });
}

export async function updateRoom(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    theme: z.string().optional(),
    background: z.string().optional().nullable(),
    musicTheme: z.string().optional().nullable(),
    ambient: z.string().optional().nullable(),
  });
  const data = schema.parse(req.body);
  const room = await prisma.digitalRoom.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...data },
    update: data,
    include: { items: true },
  });
  res.json({ room });
}

export async function addItem(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    type: z.string(),
    positionX: z.number().int().default(0),
    positionY: z.number().int().default(0),
    rotation: z.number().int().default(0),
    scale: z.number().default(1),
    metadata: z.record(z.any()).optional(),
  });
  const data = schema.parse(req.body);
  const room = await prisma.digitalRoom.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id },
    update: {},
  });
  const item = await prisma.roomItem.create({
    data: { ...data, roomId: room.id, metadata: data.metadata ?? undefined },
  });
  res.status(201).json({ item });
}

export async function updateItem(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const itemId = req.params.itemId;
  const schema = z.object({
    positionX: z.number().int().optional(),
    positionY: z.number().int().optional(),
    rotation: z.number().int().optional(),
    scale: z.number().optional(),
    metadata: z.record(z.any()).optional(),
  });
  const data = schema.parse(req.body);
  const existing = await prisma.roomItem.findUnique({ where: { id: itemId }, include: { room: true } });
  if (!existing || existing.room.userId !== req.user.id) throw new HttpError(404, "item_not_found");
  const item = await prisma.roomItem.update({
    where: { id: itemId },
    data: { ...data, metadata: data.metadata ?? undefined },
  });
  res.json({ item });
}

export async function removeItem(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const itemId = req.params.itemId;
  const existing = await prisma.roomItem.findUnique({ where: { id: itemId }, include: { room: true } });
  if (!existing || existing.room.userId !== req.user.id) throw new HttpError(404, "item_not_found");
  await prisma.roomItem.delete({ where: { id: itemId } });
  res.json({ ok: true });
}
