import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import {
  buildAuthorizeUrl,
  exchangeCode,
  fetchCurrentTrack,
  fetchPlaylists,
  fetchProfile,
  fetchRecommendations,
} from "../spotify/spotify.service";
import { prisma } from "../services/prisma";
import { redis } from "../services/redis";
import { env } from "../config/env";
import { findEra } from "../config/eras";
import { verifyAccessToken } from "../services/jwt";

const STATE_PREFIX = "spotify:state:";
const STATE_TTL = 60 * 10;

// ── In-memory OAuth state fallback (used when Redis is unavailable) ──────────
const memState = new Map<string, { userId: string; expiresAt: number }>();
async function stateSave(key: string, userId: string): Promise<void> {
  if (redis) { await redis.set(key, userId, "EX", STATE_TTL); return; }
  memState.set(key, { userId, expiresAt: Date.now() + STATE_TTL * 1000 });
}
async function stateGet(key: string): Promise<string | null> {
  if (redis) return redis.get(key);
  const entry = memState.get(key);
  if (!entry || Date.now() > entry.expiresAt) { memState.delete(key); return null; }
  return entry.userId;
}
async function stateDel(key: string): Promise<void> {
  if (redis) { await redis.del(key); return; }
  memState.delete(key);
}

export async function login(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  if (!env.spotifyClientId) throw new HttpError(500, "spotify_not_configured");
  const state = randomUUID();
  await stateSave(`${STATE_PREFIX}${state}`, req.user.id);
  res.json({ url: buildAuthorizeUrl(state) });
}

// /api/spotify/authorize?token=... — redirige directo a Spotify
export async function authorizeRedirect(req: Request, res: Response): Promise<void> {
  if (!env.spotifyClientId) throw new HttpError(500, "spotify_not_configured");
  const token = String(req.query.token ?? "");
  if (!token) throw new HttpError(401, "unauthorized");
  let userId: string;
  try {
    userId = verifyAccessToken(token).sub;
  } catch {
    throw new HttpError(401, "invalid_token");
  }
  const state = randomUUID();
  await stateSave(`${STATE_PREFIX}${state}`, userId);
  res.redirect(buildAuthorizeUrl(state));
}

export async function callback(req: Request, res: Response): Promise<void> {
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");
  const err = req.query.error;
  if (err) {
    res.redirect(`${env.frontendUrl}/spotify/callback?error=${encodeURIComponent(String(err))}`);
    return;
  }
  if (!code || !state) {
    res.redirect(`${env.frontendUrl}/spotify/callback?error=missing_params`);
    return;
  }
  const userId = await stateGet(`${STATE_PREFIX}${state}`);
  if (!userId) {
    res.redirect(`${env.frontendUrl}/spotify/callback?error=invalid_state`);
    return;
  }
  await stateDel(`${STATE_PREFIX}${state}`);

  try {
    const tokens = await exchangeCode(code);
    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token ?? undefined,
        spotifyTokenExpires: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });
    const profile = await fetchProfile(userId);
    if (profile) {
      await prisma.user.update({ where: { id: userId }, data: { spotifyId: profile.id } });
    }
    res.redirect(`${env.frontendUrl}/spotify/callback?ok=1`);
  } catch (e) {
    console.error("[spotify] callback error", e);
    res.redirect(`${env.frontendUrl}/spotify/callback?error=token_exchange_failed`);
  }
}

export async function disconnect(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpires: null,
      spotifyId: null,
    },
  });
  await prisma.userStatus.update({
    where: { userId: req.user.id },
    data: { spotifyTrack: null, spotifyArtist: null, spotifyCover: null, spotifyUrl: null },
  });
  res.json({ ok: true });
}

export async function currentTrack(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const data = await fetchCurrentTrack(req.user.id);
  if (data.isPlaying && data.track) {
    await prisma.userStatus.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        status: "online",
        spotifyTrack: data.track.name,
        spotifyArtist: data.track.artists.join(", "),
        spotifyCover: data.track.cover ?? null,
        spotifyUrl: data.track.url ?? null,
      },
      update: {
        spotifyTrack: data.track.name,
        spotifyArtist: data.track.artists.join(", "),
        spotifyCover: data.track.cover ?? null,
        spotifyUrl: data.track.url ?? null,
      },
    });
  }
  res.json(data);
}

export async function playlists(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const data = await fetchPlaylists(req.user.id);
  res.json(data ?? { items: [] });
}

export async function recommendations(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const eraId = String(req.query.era ?? "");
  const era = findEra(eraId);
  const seeds = era ? mapEraToSeeds(era.id) : ["chill", "ambient", "electronic"];
  const data = await fetchRecommendations(req.user.id, seeds);
  res.json(data ?? { tracks: [] });
}

function mapEraToSeeds(era: string): string[] {
  switch (era) {
    case "verano-2000":
      return ["pop", "dance", "electronic"];
    case "otono-2004":
      return ["alt-rock", "indie", "emo"];
    case "navidad-2007":
      return ["indie", "electronic", "pop"];
    case "primavera-2009":
      return ["indie", "indie-pop", "electronic"];
    case "madrugada-2003":
      return ["chill", "ambient", "trip-hop"];
    default:
      return ["chill", "ambient"];
  }
}
