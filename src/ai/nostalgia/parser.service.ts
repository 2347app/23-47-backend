// =====================================================
// Phase 1 — Semantic Nostalgia Parser
// Extracts identity, not just objects.
// "Who WAS that person" not "what did they own"
// =====================================================

import { jsonChat, getOpenAI } from "../openai";
import { ERAS } from "../../config/eras";
import type { SemanticProfile, LightingProfile } from "./types";
import { detectYear } from "../../services/cultural-memory.service";
import { buildTemporalContextString } from "../../data/temporal-world";

const ERA_IDS = ERAS.map((e) => e.id).join(", ");

export async function parseNostalgiaInput(input: string): Promise<SemanticProfile> {
  if (!getOpenAI()) return fallbackParse(input);

  // Inject temporal world context — gives AI historically accurate cultural anchors
  const detectedYear = detectYear(input);
  const temporalCtx = buildTemporalContextString(detectedYear);

  const system =
    "Eres un analizador semántico de nostalgia digital española. " +
    "Analiza la descripción del usuario sobre sus recuerdos de internet/adolescencia 2000-2009. " +
    "Tu objetivo: extraer la IDENTIDAD EMOCIONAL. No solo qué objetos tenía — quién ERA esa persona. " +
    "Piensa en personalidad, energía emocional, contexto cultural ESPAÑOL específico. Output: JSON estricto.";

  const user = `Entrada del usuario: "${input}"

Contexto cultural real de España ${detectedYear} (úsalo para enriquecer los culturalMarkers):
${temporalCtx}

Eras disponibles: ${ERA_IDS}

Devuelve JSON con:
- era: la era más probable de la lista
- personality: tipo de personalidad (máx 4 palabras, ej: "introverted night gamer")
- musicIdentity: identidad musical (ej: "emo pop-punk 2004", "mainstream pop adolescente")
- roomEnergy: energía de la habitación (ej: "digital refuge", "social chaos", "comfortable solitude", "emotional fortress")
- socialIdentity: identidad social (ej: "msn teenager", "solo gamer", "forum lurker", "creative loner")
- lightingProfile: exactamente uno de: "cold_blue_monitor" | "warm_lamp_glow" | "crt_amber" | "mixed_ambient" | "darkness_screen" | "afternoon_sun"
- emotionalDensity: exactamente uno de: "low" | "medium" | "high"
- visualNoise: exactamente uno de: "minimal" | "medium" | "chaotic"
- comfortLevel: descripción del nivel de confort (ej: "safe_chaotic", "cozy_isolated", "social_warm", "intense_refuge")
- culturalMarkers: array de referencias culturales específicas en snake_case (ej: ["ps2", "msn_messenger", "linkin_park", "pes", "cd_collection", "winamp"])
- timePattern: exactamente uno de: "day" | "evening" | "night" | "late_night"`;

  try {
    const result = await jsonChat<SemanticProfile>({ system, user, temperature: 0.7 });
    return sanitizeProfile(result);
  } catch {
    return fallbackParse(input);
  }
}

function sanitizeProfile(raw: Partial<SemanticProfile>): SemanticProfile {
  const validLighting: LightingProfile[] = [
    "cold_blue_monitor", "warm_lamp_glow", "crt_amber",
    "mixed_ambient", "darkness_screen", "afternoon_sun",
  ];
  const validDensity = ["low", "medium", "high"] as const;
  const validNoise = ["minimal", "medium", "chaotic"] as const;
  const validTime = ["day", "evening", "night", "late_night"] as const;

  return {
    era: raw.era ?? "madrugada-2003",
    personality: raw.personality ?? "introverted digital teenager",
    musicIdentity: raw.musicIdentity ?? "early 2000s alternative",
    roomEnergy: raw.roomEnergy ?? "digital refuge",
    socialIdentity: raw.socialIdentity ?? "msn teenager",
    lightingProfile: validLighting.includes(raw.lightingProfile as LightingProfile)
      ? (raw.lightingProfile as LightingProfile)
      : "cold_blue_monitor",
    emotionalDensity: validDensity.includes(raw.emotionalDensity as any)
      ? (raw.emotionalDensity as "low" | "medium" | "high")
      : "medium",
    visualNoise: validNoise.includes(raw.visualNoise as any)
      ? (raw.visualNoise as "minimal" | "medium" | "chaotic")
      : "medium",
    comfortLevel: raw.comfortLevel ?? "safe_chaotic",
    culturalMarkers: Array.isArray(raw.culturalMarkers) ? raw.culturalMarkers : [],
    timePattern: validTime.includes(raw.timePattern as any)
      ? (raw.timePattern as "day" | "evening" | "night" | "late_night")
      : "night",
  };
}

function fallbackParse(input: string): SemanticProfile {
  const lower = input.toLowerCase();
  const markers: string[] = [];

  const DETECTION: [string[], string][] = [
    [["ps2", "playstation 2", "playstation2"], "ps2"],
    [["ps1", "playstation 1"], "ps1"],
    [["msn", "messenger", "hotmail"], "msn_messenger"],
    [["linkin park", "linkinpark"], "linkin_park"],
    [["avril lavigne", "avril"], "avril_lavigne"],
    [["my chemical romance", "mcr"], "my_chemical_romance"],
    [["pes", "pro evolution"], "pes"],
    [["winamp"], "winamp"],
    [["myspace"], "myspace"],
    [["mp3"], "mp3_player"],
    [["cd ", "cds", "disco"], "cd_collection"],
    [["pc ", "ordenador", "computadora", "computador"], "pc_gaming"],
    [["counter", "cs "], "counter_strike"],
    [["habbo"], "habbo_hotel"],
    [["tuenti"], "tuenti"],
    [["foro", "forocoches"], "forum_user"],
    [["napster", "emule", "torrent", "kazaa"], "p2p_music"],
  ];

  for (const [terms, marker] of DETECTION) {
    if (terms.some((t) => lower.includes(t))) markers.push(marker);
  }

  const isNight =
    lower.includes("noche") ||
    lower.includes("madrugada") ||
    lower.includes("tarde") ||
    lower.includes("despierto") ||
    lower.includes("hasta tarde");

  const hasConsole = markers.some((m) => ["ps2", "ps1"].includes(m));
  const hasMessenger = markers.includes("msn_messenger");

  return {
    era: "madrugada-2003",
    personality: hasConsole ? "night gamer introvert" : "digital social teenager",
    musicIdentity: "early 2000s alternative",
    roomEnergy: isNight ? "digital refuge" : "social comfort",
    socialIdentity: hasMessenger ? "msn teenager" : "solo gamer",
    lightingProfile: isNight ? "cold_blue_monitor" : "warm_lamp_glow",
    emotionalDensity: "medium",
    visualNoise: "medium",
    comfortLevel: "safe_chaotic",
    culturalMarkers: markers.length > 0 ? markers : ["msn_messenger", "crt_monitor"],
    timePattern: isNight ? "late_night" : "evening",
  };
}
