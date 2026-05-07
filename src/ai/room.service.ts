import { findEra } from "../config/eras";
import { getOpenAI, jsonChat } from "./openai";

export interface RebuiltRoom {
  era: string;
  ambient: string;
  background: string;
  musicTheme: string;
  description: string;
  items: Array<{
    type: string;
    label: string;
    positionX: number;
    positionY: number;
    rotation?: number;
    scale?: number;
    metadata?: Record<string, unknown>;
  }>;
}

export async function rebuildRoom(input: { era: string; memories?: string }): Promise<RebuiltRoom> {
  const era = findEra(input.era) ?? findEra("madrugada-2003")!;

  if (!getOpenAI()) return fallback(era);

  const system =
    "You design cinematic emotional digital teen bedrooms inspired by internet 2000s. Output strict JSON.";
  const user = `Reconstruye una habitación digital emocional para la época "${era.label}".
Memorias del usuario: ${input.memories ?? "ninguna proporcionada"}.

Devuelve JSON con:
- era: "${era.id}"
- ambient: uno de "rain","crt","warm","neon","calm","wind"
- background: una descripción corta del fondo
- musicTheme: descripción del estilo musical
- description: 2 frases cinematográficas en español
- items: array de 6-9 objetos con {type, label, positionX (0-100), positionY (0-100), rotation (-15..15), scale (0.7-1.2), metadata}.
  Tipos válidos: poster, console, lamp, crt, plant, vinyl, photo, computer, phone, bed, window.`;
  try {
    return await jsonChat<RebuiltRoom>({ system, user, temperature: 0.9 });
  } catch (err) {
    console.error("[ai] rebuild-room error", err);
    return fallback(era);
  }
}

function fallback(era: NonNullable<ReturnType<typeof findEra>>): RebuiltRoom {
  return {
    era: era.id,
    ambient: era.ambient,
    background: `Pared con luz tenue ${era.palette.accent}, póster recortado de revista.`,
    musicTheme: era.musicSeed.join(", "),
    description: `Una habitación a las 23:47, monitor encendido y la persiana medio cerrada. ${era.description}`,
    items: [
      { type: "crt", label: "Monitor CRT", positionX: 30, positionY: 55, rotation: 0, scale: 1 },
      { type: "lamp", label: "Lámpara cálida", positionX: 8, positionY: 45, rotation: -3, scale: 0.9 },
      { type: "poster", label: "Póster de banda", positionX: 70, positionY: 18, rotation: 2, scale: 1 },
      { type: "console", label: "Consola con mando", positionX: 55, positionY: 78, rotation: 0, scale: 0.95 },
      { type: "vinyl", label: "Vinilos apilados", positionX: 82, positionY: 72, rotation: -5, scale: 0.8 },
      { type: "plant", label: "Planta polvorienta", positionX: 92, positionY: 35, rotation: 0, scale: 1 },
      { type: "photo", label: "Foto polaroid", positionX: 22, positionY: 22, rotation: -8, scale: 0.7 },
    ],
  };
}
