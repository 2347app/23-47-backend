// ============================================================
// 23:47 — Cultural Memory Matching Engine
// Fase 3: correlaciona identidad → recuerdos emocionales
// ============================================================

import {
  CULTURAL_MEMORIES,
  NOSTALGIA_PACKS,
  CulturalMemory,
  NostalgiaPack,
  Region,
  TimeOfDay,
  Season,
} from "../data/cultural-memory";

export interface CulturalProfile {
  yearRange: [number, number];
  region: Region;
  timeOfDay: TimeOfDay;
  season: Season;
  categories?: string[];
  emotionalState?: "nostalgic" | "energetic" | "melancholic" | "warm" | "neutral";
}

export interface AmbientMemory {
  id: string;
  icon: string;
  text: string;
  category: string;
  intensity: number;
}

// ── Region detection from free text input ───────────────────
const REGION_KEYWORDS: Record<Region, string[]> = {
  south_spain: [
    "andalucía", "andalucia", "sevilla", "málaga", "malaga", "granada",
    "cádiz", "cadiz", "córdoba", "cordoba", "almería", "almeria", "huelva",
    "jaén", "jaen", "sur", "south", "fondo flamenco", "flamenco", "calor",
    "verano sur", "levante", "murcia",
  ],
  madrid: [
    "madrid", "madrileño", "madrileno", "capital",
  ],
  catalonia: [
    "cataluña", "catalonia", "barcelona", "barça", "barca",
  ],
  north_spain: [
    "bilbao", "san sebastián", "san sebastian", "país vasco", "pais vasco",
    "galicia", "asturias", "cantabria", "norte",
  ],
  universal: [],
};

export function detectRegion(input: string): Region {
  const lower = input.toLowerCase();
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (region === "universal") continue;
    if (keywords.some((kw) => lower.includes(kw))) return region as Region;
  }
  return "universal";
}

// ── Era / year detection from input ─────────────────────────
export function detectYear(input: string): number {
  const explicit = input.match(/\b(200[0-9]|2010)\b/);
  if (explicit) return parseInt(explicit[1], 10);

  const lower = input.toLowerCase();
  if (lower.includes("ot1") || lower.includes("operación triunfo") || lower.includes("bisbal")) return 2002;
  if (lower.includes("gta san andreas") || lower.includes("san andreas")) return 2005;
  if (lower.includes("tuenti")) return 2008;
  if (lower.includes("fotolog")) return 2005;
  if (lower.includes("pes 5") || lower.includes("pes5")) return 2005;
  if (lower.includes("messenger")) return 2006;
  if (lower.includes("emule") || lower.includes("eMule")) return 2004;
  if (lower.includes("nokia")) return 2004;
  if (lower.includes("counter-strike") || lower.includes("counter strike") || lower.includes("cs 1.6")) return 2003;

  return 2005; // default mid-2000s
}

// ── Time-of-day from current hour ───────────────────────────
export function detectTimeOfDay(hour?: number): TimeOfDay {
  const h = hour ?? new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  if (h >= 21 && h < 24) return "night";
  return "late_night";
}

// ── Season from current date ─────────────────────────────────
export function detectSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

// ── Emotional impact score ───────────────────────────────────
function scoreMemory(memory: CulturalMemory, profile: CulturalProfile): number {
  let score = memory.intensity;

  // Year proximity
  const [profileYearStart, profileYearEnd] = profile.yearRange;
  const [memYearStart, memYearEnd] = memory.yearRange;
  const overlap =
    Math.min(profileYearEnd, memYearEnd) - Math.max(profileYearStart, memYearStart);
  if (overlap < 0) score -= 4;
  else if (overlap >= 2) score += 3;
  else score += 1;

  // Region match
  if (memory.region === "universal") score += 1;
  else if (memory.region === profile.region) score += 3;
  else score -= 2;

  // Time-of-day match
  if (memory.timeOfDay === "any" || memory.timeOfDay === profile.timeOfDay) score += 2;

  // Season match
  if (memory.season === "any" || memory.season === profile.season) score += 1;

  // Category preference
  if (profile.categories?.includes(memory.category)) score += 2;

  // Emotional state boost
  if (profile.emotionalState === "melancholic" && memory.emotionalTags.includes("nostalgia")) score += 2;
  if (profile.emotionalState === "warm" && memory.emotionalTags.includes("warm")) score += 2;
  if (profile.emotionalState === "energetic" && memory.emotionalTags.includes("energy")) score += 2;
  if (profile.emotionalState === "nostalgic") score += 1;

  return score;
}

// ── Main API ─────────────────────────────────────────────────

export function getAmbientMemories(
  profile: CulturalProfile,
  count: number = 4,
): AmbientMemory[] {
  const scored = CULTURAL_MEMORIES
    .map((m) => ({ memory: m, score: scoreMemory(m, profile) }))
    .sort((a, b) => b.score - a.score);

  // Take top scored + some randomness from top 15
  const top15 = scored.slice(0, 15);
  const shuffled = [...top15].sort(() => Math.random() - 0.3);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map(({ memory }) => ({
    id: memory.id,
    icon: memory.icon,
    text: memory.ambient,
    category: memory.category,
    intensity: memory.intensity,
  }));
}

export function buildCulturalProfileFromInput(input: string, hour?: number): CulturalProfile {
  const year = detectYear(input);
  const region = detectRegion(input);
  const timeOfDay = detectTimeOfDay(hour);
  const season = detectSeason();

  const lower = input.toLowerCase();
  const categories: string[] = [];
  if (/messenger|tuenti|fotolog|internet|emule|ares/.test(lower)) categories.push("internet");
  if (/ps2|ps1|gta|pes|nintendo|game|juego/.test(lower)) categories.push("games");
  if (/tele|serie|anima|shin chan|simpson|dragon ball/.test(lower)) categories.push("tv");
  if (/cancion|musica|canto|album|disco|band/.test(lower)) categories.push("music");

  const emotionalKeywords = {
    melancholic: ["solo", "sola", "noche", "melancolia", "extraño", "echo de menos"],
    warm: ["familia", "verano", "calor", "amigos", "bonito"],
    energetic: ["fiesta", "jugar", "gritar", "colegas", "deporte"],
    nostalgic: ["recuerdo", "aquella", "entonces", "cuando era", "de pequeño"],
  };

  let emotionalState: CulturalProfile["emotionalState"] = "nostalgic";
  for (const [state, keywords] of Object.entries(emotionalKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      emotionalState = state as CulturalProfile["emotionalState"];
      break;
    }
  }

  return {
    yearRange: [year - 1, year + 2],
    region,
    timeOfDay,
    season,
    categories,
    emotionalState,
  };
}

export function getPackById(id: string): NostalgiaPack | undefined {
  return NOSTALGIA_PACKS.find((p) => p.id === id);
}

export function getPackMemories(packId: string): CulturalMemory[] {
  const pack = getPackById(packId);
  if (!pack) return [];
  return CULTURAL_MEMORIES.filter((m) => pack.coreMemoryIds.includes(m.id));
}

export function getAllPacks(): NostalgiaPack[] {
  return NOSTALGIA_PACKS;
}

export function getAmbientMemoriesByHour(hour: number, region: Region = "universal"): AmbientMemory[] {
  const timeOfDay = detectTimeOfDay(hour);
  const season = detectSeason();
  const profile: CulturalProfile = {
    yearRange: [2003, 2008],
    region,
    timeOfDay,
    season,
    emotionalState: hour >= 22 || hour < 4 ? "melancholic" : "nostalgic",
  };
  return getAmbientMemories(profile, 5);
}
