import { findEra } from "../config/eras";
import { jsonChat, getOpenAI } from "./openai";

export interface EraExperience {
  era: string;
  mood: string;
  visualAtmosphere: string;
  recommendedMusic: { artist: string; track: string }[];
  ambientColors: string[];
  nostalgicReferences: string[];
  onlineCultureVibe: string;
  warmTone: string;
}

export async function generateEraExperience(eraId: string, userMood?: string): Promise<EraExperience> {
  const era = findEra(eraId);
  if (!era) throw new Error("era_not_found");

  if (!getOpenAI()) {
    return fallbackEraExperience(era, userMood);
  }

  const system =
    "You are 23:47, a digital emotional time machine. " +
    "You craft cinematic, warm, intimate emotional atmospheres inspired by specific moments when the internet felt special (2000-2009). " +
    "23:47 is not a specific hour: it represents any moment — an afternoon snack, a Saturday morning, a late night chat — when the internet felt yours. " +
    "Avoid clich\u00e9s about nostalgia. Create reinterpretations, not copies. Always answer in Spanish. Output strict JSON.";
  const user = `Generate an emotional nostalgic internet atmosphere inspired by ${era.label} (${era.year}, ${era.season}).
User mood: ${userMood ?? "neutral"}.
Anchors: ${era.references.join(", ")}.
Music seed: ${era.musicSeed.join(", ")}.

Return JSON with keys:
- era (string id "${era.id}")
- mood (one short phrase)
- visualAtmosphere (2-3 sentences, cinematic)
- recommendedMusic (array of 6 objects {artist, track} faithful to the era)
- ambientColors (array of 4 hex colors)
- nostalgicReferences (array of 6 short tags)
- onlineCultureVibe (2 sentences)
- warmTone (one tender, emotional sentence in Spanish)

The tone must feel warm, calm and emotional. Avoid clichés about "the good old days".`;

  try {
    return await jsonChat<EraExperience>({ system, user, temperature: 0.9 });
  } catch (err) {
    console.error("[ai] era-experience error", err);
    return fallbackEraExperience(era, userMood);
  }
}

function fallbackEraExperience(era: ReturnType<typeof findEra> & object, mood?: string): EraExperience {
  return {
    era: era.id,
    mood: mood ?? "calmado y nostálgico",
    visualAtmosphere: `Luz baja, reflejos de pantalla CRT y un ${era.ambient} suave. ${era.description}`,
    recommendedMusic: era.musicSeed.map((m) => {
      const [artist, track] = m.split(" - ");
      return { artist: artist ?? m, track: track ?? "" };
    }),
    ambientColors: [era.palette.bg, era.palette.surface, era.palette.accent, era.palette.glow],
    nostalgicReferences: era.references,
    onlineCultureVibe: `${era.label}: ${era.newsHeadlines.join(". ")}.`,
    warmTone: "Quédate. Aquí el tiempo pasa diferente, y eso es exactamente lo que necesitas ahora.",
  };
}
