import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { generateEraExperience } from "../ai/era.service";
import { nostalgiaRecommendation } from "../ai/nostalgia.service";
import { rebuildRoom } from "../ai/room.service";
import { reconstructRoom } from "../ai/nostalgia/room-builder.service";
import { getOpenAI } from "../ai/openai";
import { prisma } from "../services/prisma";
import type { EnhancedRoom } from "../ai/nostalgia/types";

const LIGHTING_DESC: Record<string, string> = {
  warm_lamp_glow: "warm incandescent desk lamp casting golden light, shadows on walls",
  cold_blue_monitor: "cold blue CRT monitor glow as the only light source",
  crt_amber: "amber CRT screen warmth, soft scanline light",
  mixed_ambient: "warm lamp mixed with cold monitor blue, contrasting shadows",
  darkness_screen: "nearly dark room illuminated only by a glowing monitor screen",
  afternoon_sun: "late afternoon sunlight filtering through partially closed blinds",
};

const TIME_DESC: Record<string, string> = {
  afternoon: "golden late afternoon",
  evening: "early evening dusk",
  night: "night",
  late_night: "2am deep night",
};

function buildRoomImagePrompt(room: EnhancedRoom): string {
  const lighting = LIGHTING_DESC[room.atmosphere.lightingProfile] ?? "dim atmospheric lighting";
  const time = TIME_DESC[room.atmosphere.timeOfDay] ?? "night";
  const objects = room.items.slice(0, 10).map((i) => i.label).join(", ");
  const grain = room.atmosphere.crtGrain ? "subtle analog film grain, " : "";
  const foggy = room.atmosphere.depthFog ? "slight atmospheric haze in the background, " : "";

  return (
    `Authentic photorealistic ${room.era} teenage bedroom, documentary photography, ` +
    `35mm film aesthetic, ${grain}${foggy}shallow depth of field. ` +
    `${time}, ${lighting}. ` +
    `Room contains: ${objects}. ` +
    `${room.description} ` +
    `Perspective: slightly elevated corner angle showing full room depth. ` +
    `Lived-in, cluttered, NOT staged. Real textures, peeling posters, worn surfaces. ` +
    `Feels like a real memory from the ${room.identity.decade}. Emotional, intimate, peligrosamente familiar.`
  ).slice(0, 3800);
}

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

export async function reconstruct(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    input: z.string().min(10).max(3000),
    apply: z.boolean().optional(),
  });
  const { input, apply } = schema.parse(req.body);

  const result = await reconstructRoom(input);

  // Generate photorealistic room image with DALL-E 3 (non-fatal)
  let imageUrl: string | undefined;
  try {
    const openai = getOpenAI();
    if (openai) {
      const imgResp = await openai.images.generate({
        model: "dall-e-3",
        prompt: buildRoomImagePrompt(result),
        n: 1,
        size: "1792x1024",
        quality: "standard",
        style: "natural",
      });
      imageUrl = imgResp.data?.[0]?.url ?? undefined;
    }
  } catch (imgErr) {
    console.warn("[reconstruct] DALL-E image generation failed (non-fatal):", imgErr);
  }

  if (apply) {
    const room = await prisma.digitalRoom.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        theme: result.era,
        ambient: result.ambient,
        background: imageUrl ?? result.background,
        musicTheme: result.musicTheme,
        nostalgiaData: result as unknown as object,
      },
      update: {
        theme: result.era,
        ambient: result.ambient,
        background: imageUrl ?? result.background,
        musicTheme: result.musicTheme,
        nostalgiaData: result as unknown as object,
      },
    });
    await prisma.roomItem.deleteMany({ where: { roomId: room.id } });
    await prisma.roomItem.createMany({
      data: result.items.map((item) => ({
        roomId: room.id,
        type: item.type,
        positionX: Math.round(item.positionX),
        positionY: Math.round(item.positionY),
        rotation: Math.round(item.rotation),
        scale: item.scale,
        metadata: item.metadata as unknown as object,
      })),
    });
  }

  await prisma.aiRecommendation.create({
    data: {
      userId: req.user.id,
      type: "room_reconstruct",
      recommendation: result.description,
      metadata: result as unknown as object,
    },
  });

  res.json({ ...result, imageUrl });
}
