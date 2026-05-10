// ============================================================
// 23:47 — Emotional Identity Engine
// Builds a rich "Room DNA" from semantic + behavioral signals.
// Two users same era + region → different rooms if personality differs.
// ============================================================

import { createHash } from "crypto";
import type { EnhancedRoom } from "../ai/nostalgia/types";

// ── Types ──────────────────────────────────────────────────────────────────

export type NightProfile    = "day_person" | "evening" | "late_night" | "nocturnal";
export type SocialEnergy    = "isolated" | "low" | "medium" | "medium_high" | "social";
export type ComfortStyle    = "minimal_cold" | "aesthetic_cold" | "warm_minimal" | "warm_chaotic" | "chaotic";
export type RoomDensity     = "sparse" | "medium" | "dense" | "chaotic";
export type EmotionalTemp   = "cold" | "neutral" | "warm" | "hot";

export interface RoomDNA {
  era:                 string;
  region:              string;
  musicIdentity:       string;
  nightProfile:        NightProfile;
  socialEnergy:        SocialEnergy;
  comfortStyle:        ComfortStyle;
  internetCulture:     string;
  roomDensity:         RoomDensity;
  emotionalTemperature: EmotionalTemp;
  behaviorSignature:   string;
  emotionalDensity:    "low" | "medium" | "high";
  nostalgiaPackId?:    string;
  // Mutation tracking — excluded from hash
  mutationVersion:     number;
  lastMutatedAt?:      string;
}

export interface BehaviorProfile {
  lateNightUser:  boolean;
  topCategories:  string[];
  avgHour:        number;
}

// ── Internet culture priority list ────────────────────────────────────────

const INTERNET_PRIORITY = [
  "msn_messenger", "messenger", "tuenti", "fotolog", "habbo_hotel",
  "myspace", "emule", "winamp", "p2p_music", "counter_strike",
  "forum_user", "pc_gaming",
];

function detectInternetCulture(markers: string[]): string {
  for (const key of INTERNET_PRIORITY) {
    if (markers.includes(key)) return key;
  }
  for (const m of markers) {
    if (m.includes("msn") || m.includes("messenger")) return "msn_messenger";
    if (m.includes("tuenti") || m.includes("fotolog")) return m;
    if (m.includes("emule") || m.includes("p2p"))      return "emule";
  }
  return "internet_generic";
}

// ── Dimension calculators ─────────────────────────────────────────────────

function calcNightProfile(room: EnhancedRoom, b?: BehaviorProfile): NightProfile {
  const hour       = b?.avgHour ?? 12;
  const isLate     = b?.lateNightUser ?? room.identity.isNocturnal;
  const timeOfDay  = room.atmosphere.timeOfDay;

  if (isLate && hour <= 4)                    return "nocturnal";
  if (isLate || timeOfDay === "late_night")    return "late_night";
  if (timeOfDay === "evening")                 return "evening";
  return "day_person";
}

function calcSocialEnergy(room: EnhancedRoom, b?: BehaviorProfile): SocialEnergy {
  const cats       = b?.topCategories ?? [];
  const hasSocial  = cats.some((c) => ["internet", "messenger"].includes(c));
  const base       = room.identity.socialPattern;

  if (base === "isolated") return hasSocial ? "low" : "isolated";
  if (base === "connected") return hasSocial ? "social" : "medium_high";
  return hasSocial ? "medium_high" : "medium";
}

function calcComfortStyle(
  room: EnhancedRoom,
  density: "low" | "medium" | "high",
  noise: "minimal" | "medium" | "chaotic",
): ComfortStyle {
  const lp     = room.atmosphere.lightingProfile;
  const isCold = ["cold_blue_monitor", "darkness_screen"].includes(lp);
  const isWarm = ["warm_lamp_glow", "crt_amber", "mixed_ambient"].includes(lp);

  if (isCold && noise === "minimal")  return "minimal_cold";
  if (isCold && density === "low")    return "aesthetic_cold";
  if (isCold)                         return "chaotic";
  if (isWarm && noise === "chaotic")  return "warm_chaotic";
  return "warm_minimal";
}

function calcRoomDensity(room: EnhancedRoom, noise: "minimal" | "medium" | "chaotic"): RoomDensity {
  const n = room.items.length;
  if (noise === "chaotic" || n > 12) return "chaotic";
  if (noise === "medium"  || n > 8)  return "dense";
  if (n > 4)                         return "medium";
  return "sparse";
}

function calcEmotionalTemp(room: EnhancedRoom, music: string): EmotionalTemp {
  const lp       = room.atmosphere.lightingProfile;
  const isCold   = ["cold_blue_monitor", "darkness_screen"].includes(lp);
  const isWarm   = ["warm_lamp_glow", "crt_amber"].includes(lp);
  const coldMusic = ["linkin_park", "my_chemical_romance", "punk", "metal", "rock_alternativo"]
    .some((m) => music.toLowerCase().includes(m));
  const warmMusic = ["fondo_flamenco", "pop_espanol", "flamenco", "bachata", "reggaeton"]
    .some((m) => music.toLowerCase().includes(m));

  if (isCold && coldMusic) return "cold";
  if (isWarm && warmMusic) return "hot";
  if (isCold || coldMusic) return "neutral";
  if (isWarm || warmMusic) return "warm";
  return "neutral";
}

function buildBehaviorSignature(
  night:   NightProfile,
  social:  SocialEnergy,
  temp:    EmotionalTemp,
  b?:      BehaviorProfile,
): string {
  const parts: string[] = [];
  parts.push(night === "nocturnal" || night === "late_night" ? "night" : "day");
  parts.push(social === "isolated" || social === "low" ? "solitary"
    : social === "social" || social === "medium_high" ? "connected" : "mixed");
  parts.push(temp === "cold" ? "introspective" : temp === "hot" || temp === "warm" ? "expressive" : "ambient");
  if (b?.topCategories[0]) parts.push(b.topCategories[0]);
  return parts.join("_");
}

// ── Public API ────────────────────────────────────────────────────────────

export function buildRoomDNA(params: {
  room:              EnhancedRoom;
  region:            string;
  emotionalDensity?: "low" | "medium" | "high";
  visualNoise?:      "minimal" | "medium" | "chaotic";
  musicIdentity?:    string;
  culturalMarkers?:  string[];
  behavior?:         BehaviorProfile;
  nostalgiaPackId?:  string;
  mutationVersion?:  number;
}): RoomDNA {
  const {
    room, region, behavior, nostalgiaPackId,
    emotionalDensity = "medium",
    visualNoise      = "medium",
    musicIdentity    = room.identity.lifestyle,
    culturalMarkers  = [],
  } = params;

  const nightProfile        = calcNightProfile(room, behavior);
  const socialEnergy        = calcSocialEnergy(room, behavior);
  const comfortStyle        = calcComfortStyle(room, emotionalDensity, visualNoise);
  const roomDensity         = calcRoomDensity(room, visualNoise);
  const emotionalTemperature = calcEmotionalTemp(room, musicIdentity);
  const internetCulture     = detectInternetCulture(culturalMarkers);
  const behaviorSignature   = buildBehaviorSignature(nightProfile, socialEnergy, emotionalTemperature, behavior);

  return {
    era: room.era,
    region,
    musicIdentity,
    nightProfile,
    socialEnergy,
    comfortStyle,
    internetCulture,
    roomDensity,
    emotionalTemperature,
    behaviorSignature,
    emotionalDensity,
    nostalgiaPackId,
    mutationVersion: params.mutationVersion ?? 1,
    lastMutatedAt:   new Date().toISOString(),
  };
}

/** SHA-256 of the stable (non-mutation-tracking) fields — 16 hex chars */
export function hashRoomDNA(dna: RoomDNA): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutationVersion: _mv, lastMutatedAt: _lm, ...stable } = dna;
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex").slice(0, 16);
}

// ── Behavioral Mutation System ────────────────────────────────────────────

const NIGHT_OPTS:  NightProfile[] = ["day_person", "evening", "late_night", "nocturnal"];
const SOCIAL_OPTS: SocialEnergy[] = ["isolated", "low", "medium", "medium_high", "social"];
const TEMP_OPTS:   EmotionalTemp[] = ["cold", "neutral", "warm", "hot"];

function enumDist(a: string, b: string, opts: string[]): number {
  const ai = opts.indexOf(a);
  const bi = opts.indexOf(b);
  if (ai === -1 || bi === -1) return a !== b ? 0.5 : 0;
  return Math.abs(ai - bi) / (opts.length - 1);
}

/** Threshold above which a real DALL-E regeneration should be suggested */
export const MUTATION_REGEN_THRESHOLD = 0.40;

/**
 * Gently mutates the stored DNA towards the user's current behavioral pattern.
 * Small drifts are applied gradually — the image is NOT regenerated automatically.
 * Returns shouldRegenerate=true only when the emotional delta is large enough.
 */
export function mutateDNA(
  current: RoomDNA,
  behavior: BehaviorProfile,
): { dna: RoomDNA; mutationDelta: number; shouldRegenerate: boolean } {
  const hour = behavior.avgHour;

  // New night profile from live behavior
  const newNight: NightProfile =
    behavior.lateNightUser && hour <= 4 ? "nocturnal" :
    behavior.lateNightUser              ? "late_night" :
    hour >= 18                          ? "evening"    : "day_person";

  // Social energy can only drift ±1 step per mutation cycle
  const hasSocial   = behavior.topCategories.some((c) => ["internet", "messenger"].includes(c));
  const socialIdx   = SOCIAL_OPTS.indexOf(current.socialEnergy);
  const socialDrift = hasSocial ? Math.min(socialIdx + 1, SOCIAL_OPTS.length - 1) : socialIdx;
  const newSocial   = SOCIAL_OPTS[socialDrift]!;

  // Emotional temperature drifts with music engagement
  const hasMusicCat = behavior.topCategories.includes("music");
  const tempIdx     = TEMP_OPTS.indexOf(current.emotionalTemperature);
  const newTempIdx  = hasMusicCat && tempIdx < TEMP_OPTS.length - 1
    ? tempIdx + 1 : tempIdx;
  const newTemp     = TEMP_OPTS[newTempIdx]!;

  // Delta across weighted dimensions
  const mutationDelta =
    enumDist(current.nightProfile,         newNight,  NIGHT_OPTS)  * 0.40 +
    enumDist(current.socialEnergy,         newSocial, SOCIAL_OPTS) * 0.30 +
    enumDist(current.emotionalTemperature, newTemp,   TEMP_OPTS)   * 0.30;

  const mutated: RoomDNA = {
    ...current,
    nightProfile:         newNight,
    socialEnergy:         newSocial,
    emotionalTemperature: newTemp,
    behaviorSignature:    buildBehaviorSignature(newNight, newSocial, newTemp, behavior),
    mutationVersion:      current.mutationVersion + 1,
    lastMutatedAt:        new Date().toISOString(),
  };

  return {
    dna: mutated,
    mutationDelta,
    shouldRegenerate: mutationDelta >= MUTATION_REGEN_THRESHOLD,
  };
}
