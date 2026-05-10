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
import {
  getAmbientMemories,
  getAmbientMemoriesByHour,
  buildCulturalProfileFromInput,
  getAllPacks,
  detectYear,
} from "../services/cultural-memory.service";
import { buildTemporalContextString } from "../data/temporal-world";

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

function buildRoomImagePrompt(room: EnhancedRoom, rawInput?: string): string {
  const lighting = LIGHTING_DESC[room.atmosphere.lightingProfile] ?? "dim atmospheric lighting";
  const time = TIME_DESC[room.atmosphere.timeOfDay] ?? "night";
  const objects = room.items.slice(0, 10).map((i) => i.label).join(", ");
  const grain = room.atmosphere.crtGrain ? "subtle analog film grain, " : "";
  const foggy = room.atmosphere.depthFog ? "slight atmospheric haze in the background, " : "";

  // Temporal World Engine — inject year-specific Spanish cultural context
  const detectedYear = rawInput ? detectYear(rawInput) : 2005;
  const culturalProfile = rawInput ? buildCulturalProfileFromInput(rawInput) : null;
  const temporalCtx = buildTemporalContextString(detectedYear, culturalProfile?.region);
  const spanishObjects = "white oscillating fan, persiana venetian blind half-closed, Spanish ceramic tiles, brown wooden furniture, CRT television, cheap bookshelf with textbooks and manga";

  return (
    `Authentic photorealistic ${room.era} Spanish teenage bedroom in Spain, documentary photography style, ` +
    `35mm film aesthetic, ${grain}${foggy}shallow depth of field. ` +
    `${time}, ${lighting}. ` +
    `Spanish middle-class apartment bedroom. Objects: ${objects}, ${spanishObjects}. ` +
    `${room.description} ` +
    `Cultural context — ${temporalCtx} ` +
    `Perspective: slightly elevated corner angle showing full room depth. ` +
    `Lived-in, cluttered, NOT staged. Real peeling posters, worn surfaces, Mediterranean light quality. ` +
    `Feels like a real Spanish memory from ${detectedYear}. Emotional, intimate, reconocible.`
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
    forceImage: z.boolean().optional().default(false),
  });
  const { input, apply, forceImage } = schema.parse(req.body);

  const result = await reconstructRoom(input);

  // Check if user already has a persisted image to avoid unnecessary DALL-E costs
  const existingRoom = await prisma.digitalRoom.findUnique({ where: { userId: req.user.id } });
  const hasExistingImage = existingRoom?.background?.startsWith("http") ?? false;

  // Generate photorealistic room image with DALL-E 3 (non-fatal, cached)
  let imageUrl: string | undefined;
  if (forceImage || !hasExistingImage) {
    try {
      const openai = getOpenAI();
      if (openai) {
        const imgResp = await openai.images.generate({
          model: "dall-e-3",
          prompt: buildRoomImagePrompt(result, input),
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
  } else {
    imageUrl = existingRoom?.background ?? undefined;
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

  // Persist cultural profile detected from this reconstruction
  const culturalProfile = buildCulturalProfileFromInput(input);
  await prisma.userCulturalProfile.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      region: culturalProfile.region,
      detectedEraRange: `${culturalProfile.yearRange[0]}-${culturalProfile.yearRange[1]}`,
      culturalVector: culturalProfile as unknown as object,
      lastReconstructedAt: new Date(),
    },
    update: {
      region: culturalProfile.region,
      detectedEraRange: `${culturalProfile.yearRange[0]}-${culturalProfile.yearRange[1]}`,
      culturalVector: culturalProfile as unknown as object,
      lastReconstructedAt: new Date(),
    },
  });

  res.json({ ...result, imageUrl });
}

export async function ambientMemories(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const hour = parseInt((req.query.hour as string) ?? String(new Date().getHours()), 10);
  const input = (req.query.input as string) ?? "";
  const count = Math.min(parseInt((req.query.count as string) ?? "4", 10), 8);

  // Behavioral pattern for personalisation (Fase 8)
  const behavior = await getBehavioralPattern(req.user.id);
  const effectiveHour = behavior.lateNightUser ? Math.max(hour, 22) : hour;

  let memories;
  if (input.length >= 5) {
    const profile = buildCulturalProfileFromInput(input, effectiveHour);
    // Boost preferred categories from behavioral history
    if (behavior.topCategories.length > 0) {
      profile.categories = [...(profile.categories ?? []), ...behavior.topCategories];
    }
    memories = getAmbientMemories(profile, count);
  } else {
    const stored = await prisma.userCulturalProfile.findUnique({ where: { userId: req.user.id } });
    const region = (stored?.region as any) ?? "universal";
    const prefs = (stored?.ambientPreferences as Record<string, number> | null) ?? {};
    let pool = getAmbientMemoriesByHour(effectiveHour, region);
    // Sort preferred categories to front
    if (Object.keys(prefs).length > 0) {
      pool = pool.sort((a, b) => (prefs[b.category] ?? 0) - (prefs[a.category] ?? 0));
    }
    memories = pool.slice(0, count);
  }

  res.json({ memories, hour, behavioral: { lateNightUser: behavior.lateNightUser } });
}

export async function nostalgiaPacks(_req: AuthedRequest, res: Response): Promise<void> {
  res.json({ packs: getAllPacks() });
}

// ── Fase 8: Emotional Memory Evolution ──────────────────────────────────────
export async function trackMemoryEvent(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({
    memoryId:       z.string(),
    memoryCategory: z.string(),
    dismissed:      z.boolean().optional().default(false),
  });
  const { memoryId, memoryCategory, dismissed } = schema.parse(req.body);

  const now = new Date();
  await prisma.ambientMemoryEvent.create({
    data: {
      userId:         req.user.id,
      memoryId,
      memoryCategory,
      hourOfDay:      now.getHours(),
      dayOfWeek:      now.getDay(),
      dismissed,
    },
  });

  // Update ambient preferences on cultural profile based on engagement
  // If not dismissed → category gets a positive weight boost
  if (!dismissed) {
    const existing = await prisma.userCulturalProfile.findUnique({ where: { userId: req.user.id } });
    const prefs = (existing?.ambientPreferences as Record<string, number> | null) ?? {};
    prefs[memoryCategory] = (prefs[memoryCategory] ?? 0) + 1;

    await prisma.userCulturalProfile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, ambientPreferences: prefs },
      update: { ambientPreferences: prefs },
    });
  }

  res.json({ ok: true });
}

// ── Behavioral pattern used by ambientMemories to personalise ────────────────
export async function getBehavioralPattern(userId: string): Promise<{
  lateNightUser: boolean;
  topCategories: string[];
  avgHour: number;
}> {
  const events = await prisma.ambientMemoryEvent.findMany({
    where: { userId, dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (events.length === 0) return { lateNightUser: false, topCategories: [], avgHour: 12 };

  const avgHour = Math.round(events.reduce((s: number, e: { hourOfDay: number }) => s + e.hourOfDay, 0) / events.length);
  const lateNightUser = avgHour >= 22 || avgHour <= 4;

  const catCount: Record<string, number> = {};
  for (const e of events) catCount[e.memoryCategory] = (catCount[e.memoryCategory] ?? 0) + 1;
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  return { lateNightUser, topCategories, avgHour };
}
