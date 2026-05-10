// ============================================================
// 23:47 — Room Image Pipeline
// OpenAI URL → buffer → Cloudflare R2 → persistent URL
// Includes emotional hash cache to skip redundant DALL-E calls
// ============================================================

import https from "https";
import http from "http";
import { uploadToR2, isR2Configured } from "./storage/r2.service";
import { prisma } from "./prisma";
import { hashRoomDNA, type RoomDNA } from "./emotional-identity-engine";
import type { EnhancedRoom } from "../ai/nostalgia/types";

// ── Download buffer from OpenAI (URL is temporary — must act fast) ─────────
export async function downloadImageBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

// ── Core pipeline ──────────────────────────────────────────────────────────
export async function persistRoomImage(params: {
  userId: string;
  roomId: string;
  openAiUrl: string;
  room: EnhancedRoom;
  dna: RoomDNA;
}): Promise<string> {
  const { userId, roomId, openAiUrl, dna } = params;

  const emotionalHash = hashRoomDNA(dna);

  // Cache hit — return existing R2 URL without re-uploading
  const cached = await prisma.roomImageVersion.findFirst({
    where: { roomId, emotionalHash },
    orderBy: { version: "desc" },
  });
  if (cached) {
    console.log(`[pipeline] Cache hit — reusing v${cached.version} (hash: ${emotionalHash})`);
    return cached.imageUrl;
  }

  // R2 not configured — return OpenAI URL as-is (temporary fallback)
  if (!isR2Configured()) {
    console.warn("[pipeline] R2 not configured — returning temporary OpenAI URL");
    return openAiUrl;
  }

  // Download buffer from OpenAI (temporary URL — fetch immediately)
  const buffer = await downloadImageBuffer(openAiUrl);

  // Version increment
  const current = await prisma.digitalRoom.findUnique({
    where: { id: roomId },
    select: { imageVersion: true },
  });
  const nextVersion = (current?.imageVersion ?? 0) + 1;

  // Upload to R2
  const key = `rooms/${userId}/${roomId}/v${nextVersion}.png`;
  const persistentUrl = await uploadToR2(buffer, key, "image/png");

  // Save version history
  await prisma.roomImageVersion.create({
    data: { roomId, imageUrl: persistentUrl, emotionalHash, version: nextVersion },
  });

  // Update room record with new persistent URL
  await prisma.digitalRoom.update({
    where: { id: roomId },
    data: {
      imageUrl: persistentUrl,
      imageVersion: nextVersion,
      emotionalHash,
      lastGeneratedAt: new Date(),
    },
  });

  console.log(`[pipeline] Persisted image v${nextVersion} → ${persistentUrl}`);
  return persistentUrl;
}

// ── Restore: find latest persistent image for a room ───────────────────────
export async function restoreRoomImage(roomId: string): Promise<string | null> {
  const latest = await prisma.roomImageVersion.findFirst({
    where: { roomId },
    orderBy: { version: "desc" },
  });
  return latest?.imageUrl ?? null;
}
