// ============================================================
// 23:47 — Room Schema Engine
// Converts raw user text → deterministic RoomSchema.
// The AI renders a validated structure, it does NOT decide the room.
// ============================================================

import { jsonChat } from "../openai";

export interface RoomSchema {
  geometry: {
    roomShape?:  "square" | "rectangular" | "L-shaped";
    deskShape?:  "L" | "rectangular" | "corner" | "simple";
    roomSize?:   "small" | "medium" | "large";
  };
  walls: {
    color?:         string;           // e.g. "light blue", "white", "cream"
    texture?:       string;
    decorations?:   string[];         // ONLY if explicitly mentioned
    postersAllowed: boolean;          // false unless user explicitly mentions posters/photos
  };
  windows: {
    count?:    number;
    open?:     boolean;
    hasBlind?: boolean;
    position?: "left_wall" | "right_wall" | "behind_desk" | "facing" | "unknown";
  };
  furniture: {
    desk?:     { shape?: string; position?: string; material?: string };
    bed?:      { type?: string; position?: string };
    wardrobe?: { present: boolean };
    chair?:    { type?: string };
    shelves?:  { present: boolean; contents?: string };
  };
  computer: {
    present:       boolean;
    monitorType?:  "crt" | "flat" | "laptop";
    programs?:     string[];
    messengerOpen?: boolean;
  };
  lighting: {
    natural:    boolean;
    artificial?: string;
    quality?:   string;
    timeOfDay?: string;
  };
  atmosphere: {
    music?:    string;
    weather?:  string;
    season?:   "summer" | "winter" | "autumn" | "spring";
  };
  forbiddenElements:    string[];   // things NOT in the room
  explicitlyMentioned:  string[];   // exact things the user named
}

// ── OpenAI schema extraction ──────────────────────────────────────────────

const SCHEMA_SYSTEM = `You are a spatial memory parser. Extract ONLY what the user explicitly describes.

CRITICAL RULES:
1. Only include elements the user explicitly mentions. NEVER invent.
2. postersAllowed = true ONLY if user mentions posters, photos, or images on walls.
3. postersAllowed = false if user says "sin posters", "no posters", or says nothing about them.
4. forbiddenElements: things explicitly said to NOT be there + contextual incompatibilities.
5. explicitlyMentioned: exact objects the user names.

CONTEXTUAL INCOMPATIBILITY RULES (add to forbiddenElements automatically):
- "flamenco" or "fondo flamenco" → add: emo_aesthetic, dark_grunge, metal_posters, cyberpunk_look
- Light-colored walls (azul clara, blanca, beige, crema) → add: dark_walls, decay, grunge_texture
- "ordenado", "limpio", "sin mucho" → add: clutter, excessive_mess
- Spanish summer context → add: cold_grey_atmosphere
- "pared lisa", "sin nada en las paredes" → add: posters, wall_decorations

Respond ONLY with valid JSON. No explanations. No markdown.`;

export async function parseRoomSchema(rawInput: string): Promise<RoomSchema> {
  try {
    const result = await jsonChat<RoomSchema>({
      system: SCHEMA_SYSTEM,
      user:   `Extract the room schema from this description:\n\n${rawInput}`,
      temperature: 0.1,
    });
    return sanitizeSchema(result, rawInput);
  } catch {
    return buildFallbackSchema(rawInput);
  }
}

// ── Sanitize + enforce hard rules on any schema ───────────────────────────

function sanitizeSchema(schema: RoomSchema, rawInput: string): RoomSchema {
  const lower = rawInput.toLowerCase();

  // Enforce: "sin posters" or no poster mention → postersAllowed = false
  if (/sin poster|no poster|no ten[íi]a poster|no hab[íi]a poster/.test(lower)) {
    schema.walls.postersAllowed = false;
  }
  if (!schema.walls.postersAllowed) {
    schema.forbiddenElements = [
      ...new Set([...schema.forbiddenElements, "posters", "photo_collages", "wall_photos"]),
    ];
  }

  // Enforce: flamenco + Spanish warmth → no emo/dark
  if (/flamenco|sevillana|andaluz|chill|verano/.test(lower)) {
    schema.forbiddenElements = [
      ...new Set([...schema.forbiddenElements, "emo_aesthetic", "dark_grunge", "metal_posters"]),
    ];
  }

  return schema;
}

// ── Heuristic fallback (no OpenAI needed) ────────────────────────────────

export function buildFallbackSchema(rawInput: string): RoomSchema {
  const lower = rawInput.toLowerCase();

  const postersAllowed =
    /poster|foto en la pared|cartel|sticker en|fotos colgadas/.test(lower) &&
    !/sin poster|no poster|no hab[íi]a poster|no ten[íi]a poster/.test(lower);

  const forbidden: string[] = [
    "destroyed_walls",
    "wall_decay",
    "abandoned_aesthetic",
    "cinematic_horror",
    "dramatic_artificial_clutter",
    "grunge_aesthetic",
    "Pinterest_nostalgia_clichés",
  ];

  if (!postersAllowed) {
    forbidden.push("posters", "photo_collages", "wall_decorations");
  }
  if (/flamenco|sevillana|andaluz/.test(lower)) {
    forbidden.push("emo_aesthetic", "dark_grunge", "metal_posters", "cyberpunk");
  }
  if (/azul clar|blanca|beige|crem|pared clar/.test(lower)) {
    forbidden.push("dark_walls", "peeling_paint", "decay");
  }
  if (/ordenado|limpio|sin mucho|pocos object/.test(lower)) {
    forbidden.push("excessive_clutter", "dense_mess");
  }

  const mentioned: string[] = [];
  if (/messenger/.test(lower))               mentioned.push("MSN Messenger open on screen");
  if (/escritorio en l|mesa en l/.test(lower)) mentioned.push("L-shaped desk");
  if (/ventana abierta/.test(lower))          mentioned.push("open window");
  if (/crt|tubo/.test(lower))                mentioned.push("CRT monitor");
  if (/persiana/.test(lower))                mentioned.push("venetian blind half-closed");
  if (/ventilador/.test(lower))              mentioned.push("white oscillating fan");
  if (/nokia|movil|móvil/.test(lower))       mentioned.push("Nokia phone on desk");
  if (/ps2|playstation/.test(lower))         mentioned.push("PlayStation 2 visible");
  if (/winamp/.test(lower))                  mentioned.push("Winamp open on screen");

  return {
    geometry: {
      deskShape: /escritorio en l|mesa en l/.test(lower) ? "L" : undefined,
    },
    walls: {
      color:          extractWallColor(lower),
      postersAllowed,
    },
    windows: {
      open:     /ventana abierta/.test(lower),
      hasBlind: /persiana/.test(lower),
      count:    /dos ventanas|two windows/.test(lower) ? 2 : /ventana/.test(lower) ? 1 : undefined,
    },
    furniture: {
      desk: /escritorio|mesa de escritorio|mesa del pc/.test(lower)
        ? {
            shape:    /en l|tipo l/.test(lower) ? "L" : undefined,
            position: /debajo.*ventana|bajo.*ventana/.test(lower) ? "under window" : undefined,
          }
        : undefined,
    },
    computer: {
      present:       /ordenador|pc |monitor|crt|portátil|laptop/.test(lower),
      monitorType:   /crt|tubo/.test(lower) ? "crt" : /portátil|laptop/.test(lower) ? "laptop" : undefined,
      messengerOpen: /messenger/.test(lower),
      programs:      buildPrograms(lower),
    },
    lighting: {
      natural:    /ventana|luz natural|sol|tarde|luz del día/.test(lower),
      timeOfDay:  extractTimeOfDay(lower),
    },
    atmosphere: {
      music:  /flamenco/.test(lower) ? "flamenco background music" :
              /reggaeton/.test(lower) ? "reggaeton" :
              /rock|linkin|metallica/.test(lower) ? "rock music" : undefined,
      season: /verano|calor|agosto|julio|junio/.test(lower) ? "summer" :
              /invierno|frío|diciembre|enero/.test(lower) ? "winter" : undefined,
    },
    forbiddenElements: forbidden,
    explicitlyMentioned: mentioned,
  };
}

function extractWallColor(lower: string): string | undefined {
  if (/pared azul clar|azul pastel|azul suave/.test(lower)) return "light blue";
  if (/pared azul/.test(lower)) return "blue";
  if (/pared blanca|blanco/.test(lower)) return "white";
  if (/pared verde/.test(lower)) return "green";
  if (/pared amarilla/.test(lower)) return "yellow";
  if (/pared beige|pared crema/.test(lower)) return "beige";
  return undefined;
}

function extractTimeOfDay(lower: string): string | undefined {
  if (/tarde|atardecer/.test(lower))       return "late afternoon";
  if (/noche|de noche|las \d+am/.test(lower)) return "night";
  if (/madrugada/.test(lower))             return "2am deep night";
  if (/mañana|mediodía/.test(lower))       return "morning";
  return undefined;
}

function buildPrograms(lower: string): string[] {
  const programs: string[] = [];
  if (/messenger/.test(lower))    programs.push("MSN Messenger");
  if (/winamp/.test(lower))       programs.push("Winamp");
  if (/emule/.test(lower))        programs.push("eMule");
  if (/internet explorer/.test(lower)) programs.push("Internet Explorer");
  if (/windows xp/.test(lower))   programs.push("Windows XP desktop");
  return programs;
}
