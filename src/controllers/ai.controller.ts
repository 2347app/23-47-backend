import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { generateEraExperience } from "../ai/era.service";
import { nostalgiaRecommendation } from "../ai/nostalgia.service";
import { rebuildRoom } from "../ai/room.service";
import { prisma } from "../services/prisma";

export async function eraExperience(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({ era: z.string(), mood: z.string().optional() });
  const data = schema.parse(req.body);
  const result = await generateEraExperience(data.era, data.mood);
  await prisma.aiRecommendation.create({
    data: {
      userId: req.user.id,
      type: "era",
      recommendation: result.warmTone,
      metadata: result as unknown as object,
    },
  });
  res.json(result);
}

export async function nostalgia(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    mood: z.string().optional(),
    hour: z.number().int().min(0).max(23).optional(),
    weather: z.string().optional(),
  });
  const data = schema.parse(req.body ?? {});
  const result = await nostalgiaRecommendation(data);
  await prisma.aiRecommendation.create({
    data: {
      userId: req.user.id,
      type: "nostalgia",
      recommendation: result.message,
      metadata: result as unknown as object,
    },
  });
  res.json(result);
}

export async function rebuild(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    era: z.string(),
    memories: z.string().max(2000).optional(),
    apply: z.boolean().optional(),
  });
  const data = schema.parse(req.body);
  const result = await rebuildRoom({ era: data.era, memories: data.memories });

  if (data.apply) {
    const room = await prisma.digitalRoom.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        theme: result.era,
        ambient: result.ambient,
        background: result.background,
        musicTheme: result.musicTheme,
      },
      update: {
        theme: result.era,
        ambient: result.ambient,
        background: result.background,
        musicTheme: result.musicTheme,
      },
    });
    // Borrar items previos y aplicar nuevos
    await prisma.roomItem.deleteMany({ where: { roomId: room.id } });
    await prisma.roomItem.createMany({
      data: result.items.map((it) => ({
        roomId: room.id,
        type: it.type,
        positionX: Math.max(0, Math.min(100, Math.round(it.positionX))),
        positionY: Math.max(0, Math.min(100, Math.round(it.positionY))),
        rotation: Math.round(it.rotation ?? 0),
        scale: it.scale ?? 1,
        metadata: { label: it.label, ...(it.metadata ?? {}) },
      })),
    });
  }

  await prisma.aiRecommendation.create({
    data: {
      userId: req.user.id,
      type: "room",
      recommendation: result.description,
      metadata: result as unknown as object,
    },
  });

  res.json(result);
}
