import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { generateEraExperience } from "../ai/era.service";
import { nostalgiaRecommendation } from "../ai/nostalgia.service";
import { rebuildRoom } from "../ai/room.service";
import { reconstructRoom } from "../ai/nostalgia/room-builder.service";
import { getOpenAI } from "../ai/openai";
import { persistRoomImage, restoreRoomImage } from "../services/room-image-pipeline";
import {
  buildRoomDNA,
  hashRoomDNA,
  mutateDNA,
  type BehaviorProfile,
} from "../services/emotional-identity-engine";
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
import { parseRoomSchema } from "../ai/nostalgia/room-schema-engine";
import { buildSpatialPrompt } from "../ai/nostalgia/spatial-prompt-builder";


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
  const culturalProfile = buildCulturalProfileFromInput(input);

  // Upsert room early so we have an ID for the image pipeline
  const room = await prisma.digitalRoom.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      theme: result.era,
      ambient: result.ambient,
      background: result.background,
      musicTheme: result.musicTheme,
      nostalgiaData: result as unknown as object,
    },
    update: {
      theme: result.era,
      ambient: result.ambient,
      musicTheme: result.musicTheme,
      nostalgiaData: result as unknown as object,
    },
  });

  // ── Build rich Room DNA (Emotional Identity Engine v2) ────────────────
  const behavior = await getBehavioralPattern(req.user.id);
  const dna = buildRoomDNA({
    room: result,
    region: culturalProfile.region,
    emotionalDensity: result.emotionalDensity,
    visualNoise:      result.visualNoise,
    musicIdentity:    result.musicIdentity,
    culturalMarkers:  result.culturalMarkers,
    behavior,
  });
  const emotionalHash = hashRoomDNA(dna);
  const hashUnchanged = room.emotionalHash === emotionalHash;

  let imageUrl: string | undefined;

  if (!forceImage && hashUnchanged && room.imageUrl) {
    // Same emotional identity — return cached persistent URL (0 DALL-E cost)
    imageUrl = room.imageUrl;
    console.log(`[reconstruct] DNA hash unchanged (${emotionalHash}) — reusing persistent image`);
  } else {
    // Generate new image with DALL-E 3
    try {
      const openai = getOpenAI();
      if (openai) {
        // ── Authentic Spatial Reconstruction Pipeline ────────────────
        const detectedYear   = detectYear(input);
        const temporalCtx    = buildTemporalContextString(detectedYear, culturalProfile.region);
        const roomSchema     = await parseRoomSchema(input);
        const spatialPrompt  = buildSpatialPrompt(result, roomSchema, detectedYear, temporalCtx);
        console.log(`[reconstruct] spatial prompt (${spatialPrompt.length}ch), postersAllowed=${roomSchema.walls.postersAllowed}, forbidden=${roomSchema.forbiddenElements.length}`);

        const imgResp = await openai.images.generate({
          model: "dall-e-3",
          prompt: spatialPrompt,
          n: 1,
          size: "1792x1024",
          quality: "standard",
          style: "natural",
        });
        const openAiUrl = imgResp.data?.[0]?.url;
        if (openAiUrl) {
          imageUrl = await persistRoomImage({
            userId: req.user.id,
            roomId: room.id,
            openAiUrl,
            room: result,
            dna,
          });
        }
      }
    } catch (imgErr) {
      console.warn("[reconstruct] Image pipeline failed (non-fatal):", imgErr);
      imageUrl = (await restoreRoomImage(room.id)) ?? room.imageUrl ?? undefined;
    }
  }

  // Update room with final image URL, DNA, and items
  if (apply) {
    await prisma.digitalRoom.update({
      where: { id: room.id },
      data: {
        background:  imageUrl ?? result.background,
        roomDna:     dna as unknown as object,
        emotionalHash,
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

  res.json({ ...result, imageUrl, roomDna: dna });
}

// ── GET /ai/room/dna — returns current DNA + behavioral mutation ──────────────
export async function getRoomDna(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");

  const room = await prisma.digitalRoom.findUnique({ where: { userId: req.user.id } });
  if (!room) { res.json({ dna: null, mutationDelta: 0, shouldRegenerate: false }); return; }

  const storedDna = room.roomDna as import("../services/emotional-identity-engine").RoomDNA | null;
  if (!storedDna) { res.json({ dna: null, mutationDelta: 0, shouldRegenerate: false }); return; }

  const behavior = await getBehavioralPattern(req.user.id);
  const { dna: mutatedDna, mutationDelta, shouldRegenerate } = mutateDNA(storedDna, behavior);

  // Persist the mutated DNA silently (small gradual drift, no image regen needed)
  if (mutationDelta > 0) {
    await prisma.digitalRoom.update({
      where: { id: room.id },
      data: { roomDna: mutatedDna as unknown as object },
    });
  }

  res.json({ dna: mutatedDna, mutationDelta, shouldRegenerate });
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
