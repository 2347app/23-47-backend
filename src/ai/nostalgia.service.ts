import { ERAS } from "../config/eras";
import { jsonChat, getOpenAI } from "./openai";

export interface NostalgiaRecommendation {
  message: string;
  suggestedEra: string;
  mood: string;
  micro: string[];
}

export async function nostalgiaRecommendation(input: {
  mood?: string;
  hour?: number;
  weather?: string;
}): Promise<NostalgiaRecommendation> {
  const eraIds = ERAS.map((e) => e.id).join(", ");
  if (!getOpenAI()) {
    return fallback(input);
  }

  const system =
    "You are 23:47, a digital emotional time machine. You speak softly and poetically in Spanish. " +
    "You suggest emotional time-travel experiences inspired by the feeling of internet between 2000-2009. " +
    "23:47 is not a specific hour: it represents any moment when the internet felt special. " +
    "Output strict JSON.";
  const user = `User context:
- mood: ${input.mood ?? "calmado"}
- hour: ${input.hour ?? "noche"}
- weather: ${input.weather ?? "desconocido"}

Possible eras: ${eraIds}.
Return JSON:
- message: frase evocadora en español que invite al usuario a ese momento. Que suene como abrir un recuerdo. No uses clichés de "buenos tiempos". Ej: "Hoy parece el momento perfecto para volver a esa tarde de verano de 2003."
- suggestedEra: id del momento de la lista
- mood: mood emocional de 1-3 palabras (ej: "nostalgico y tranquilo", "cálido y lento")
- micro: 3 micro-acciones emocionales suaves para entrar en el momento (ej: "pon una canción de esa época", "cambia tu estado")`;

  try {
    return await jsonChat<NostalgiaRecommendation>({ system, user, temperature: 0.95 });
  } catch (err) {
    console.error("[ai] nostalgia error", err);
    return fallback(input);
  }
}

function fallback(input: { mood?: string; hour?: number }): NostalgiaRecommendation {
  const hour = input.hour ?? new Date().getHours();
  const era = hour >= 22 || hour < 6 ? "madrugada-2003" : hour >= 18 ? "tarde-2003" : "sabado-2002";
  return {
    message: "Hoy parece el momento perfecto para volver a ese instante en que internet se sentía tuyo.",
    suggestedEra: era,
    mood: input.mood ?? "tranquilo y nostalgico",
    micro: [
      "Pon una canción que no escuchabas desde hace años.",
      "Cambia tu estado a algo lento y personal.",
      "Abre una conversación con alguien que importa.",
    ],
  };
}
