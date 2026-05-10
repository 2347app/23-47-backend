// =====================================================
// Nostalgia Room Reconstruction — Orchestrator
// Coordinates all 7 engines into a single pipeline.
// INPUT: free text memory → OUTPUT: EnhancedRoom
// =====================================================

import { parseNostalgiaInput }     from "./parser.service";
import { reconstructIdentity }      from "./identity.service";
import { selectOntologyObjects }    from "./ontology.service";
import { buildSpatialLayout }       from "./spatial.service";
import { buildAtmosphere, calculateImperfectionLevel } from "./atmosphere.service";
import { jsonChat, getOpenAI }      from "../openai";
import { findEra }                  from "../../config/eras";
import type { EnhancedRoom, SemanticProfile } from "./types";
import { detectYear, buildCulturalProfileFromInput } from "../../services/cultural-memory.service";
import { buildTemporalContextString } from "../../data/temporal-world";

// ── Phase 7: Atmospheric description (OpenAI) ────────────────────────────────
async function generatePoetry(
  semantic: SemanticProfile,
  rawInput?: string,
): Promise<{ description: string; narrativeMoment: string }> {
  if (!getOpenAI()) return poetryFallback(semantic);

  // Temporal context — ground the poetry in real cultural facts of the year
  const detectedYear = rawInput ? detectYear(rawInput) : 2005;
  const culturalProfile = rawInput ? buildCulturalProfileFromInput(rawInput) : null;
  const temporalCtx = buildTemporalContextString(detectedYear, culturalProfile?.region);

  try {
    return await jsonChat<{ description: string; narrativeMoment: string }>({
      system:
        "Escribes descripciones cinematográficas de habitaciones de adolescentes españoles de los 2000. " +
        "Máx 2 frases por campo. Sin clichés de 'buenos tiempos'. SÍ: sensaciones físicas reales. " +
        "Temperatura, luz, olor implícito, presencia humana invisible. Cultura española específica. En español.",
      user:
        `Habitación: ${semantic.roomEnergy}. Persona: ${semantic.personality}. ` +
        `Época: ${semantic.era}. Referencias culturales: ${semantic.culturalMarkers.join(", ")}. ` +
        `Hora: ${semantic.timePattern}.\n\n` +
        `Contexto histórico real (España ${detectedYear}): ${temporalCtx}\n\n` +
        `Devuelve JSON:\n` +
        `- description: 2 frases que describan la habitación como si fuera un recuerdo parcial. Sensaciones físicas. Luz, temperatura. Detalles culturales reales del año.\n` +
        `- narrativeMoment: 1 frase que capture quién vivía aquí y qué estaba haciendo en ese instante exacto. Puede mencionar algo cultural específico del año.`,
      temperature: 0.93,
    });
  } catch {
    return poetryFallback(semantic);
  }
}

function poetryFallback(semantic: SemanticProfile): { description: string; narrativeMoment: string } {
  const timeDesc =
    semantic.timePattern === "late_night" ? "La habitación tiene esa quietud particular de las 3 de la mañana." :
    semantic.timePattern === "night" ? "Pantalla encendida, persiana cerrada, el mundo exterior en pausa." :
    semantic.timePattern === "evening" ? "La tarde se acaba pero el monitor sigue encendido." :
    "Luz de tarde filtrándose entre las persianas medio cerradas.";

  return {
    description: `${timeDesc} El tipo de desorden que solo existe cuando nadie va a venir.`,
    narrativeMoment: `Alguien que no dormía cuando debía. ${semantic.culturalMarkers[0]?.replace(/_/g, " ") ?? "internet"} como compañía.`,
  };
}

// ── Main orchestrator ─────────────────────────────────────────────────────────
export async function reconstructRoom(input: string): Promise<EnhancedRoom> {
  // Phase 1 — Semantic Parser (temporal world injected inside)
  const semantic = await parseNostalgiaInput(input);

  // Phase 2 — Identity Reconstruction
  const identity = reconstructIdentity(semantic);

  // Phase 3 — Nostalgia Ontology: select culturally coherent objects
  const ontologyObjects = selectOntologyObjects(
    semantic.culturalMarkers,
    semantic.emotionalDensity
  );

  // Phase 5+6 — Atmosphere + Imperfection level (needed before spatial)
  const imperfectionLevel = calculateImperfectionLevel(semantic, identity);
  const atmosphere = buildAtmosphere(semantic, identity);

  // Phase 4 — Spatial Narrative: place objects with weight and zone logic
  const spatialObjects = buildSpatialLayout(ontologyObjects, identity, imperfectionLevel);

  // Phase 7 — Atmospheric description (OpenAI, raw input passed for temporal context)
  const { description, narrativeMoment } = await generatePoetry(semantic, input);

  // Era lookup for backward-compatible fields
  const era = findEra(semantic.era) ?? findEra("madrugada-2003")!;

  return {
    era: semantic.era,
    identity,
    atmosphere,
    description,
    narrativeMoment,
    ambient: atmosphere.ambientType,
    background: `${era.label} — ${atmosphere.lightingProfile.replace(/_/g, " ")}`,
    musicTheme: semantic.musicIdentity,
    items: spatialObjects,
    imperfectionLevel,
    culturalMarkers:  semantic.culturalMarkers,
    emotionalDensity: semantic.emotionalDensity,
    musicIdentity:    semantic.musicIdentity,
    visualNoise:      semantic.visualNoise,
  };
}
