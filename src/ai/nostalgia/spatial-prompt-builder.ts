// ============================================================
// 23:47 — Spatial Priority Prompt Builder
// RoomSchema + EnhancedRoom → hierarchical DALL-E 3 prompt.
// The AI renders. The schema decides.
// Priority: Spatial → Walls → Furniture → Tech → Lighting → Culture → Constraints
// ============================================================

import type { EnhancedRoom } from "./types";
import type { RoomSchema } from "./room-schema-engine";
import { deriveSpatialRelationships, buildSpatialFragment } from "./spatial-relationship-engine";
import { buildCulturalDetailFragment } from "./cultural-detail-engine";

// ── Universal negative constraints — always applied ───────────────────────

const UNIVERSAL_FORBIDDEN = [
  "destroyed walls",
  "wall decay or peeling paint",
  "abandoned room aesthetic",
  "cinematic horror atmosphere",
  "artificial dramatic clutter",
  "dark grunge aesthetic",
  "photo collages (unless specified)",
  "Pinterest nostalgia style",
  "Midjourney cinematic over-dramatization",
  "supernatural or surreal elements",
  "fog or atmospheric smoke indoors",
  "modern technology in period room",
  "excessive film grain or noise",
  "editorial or fashion photography style",
  "over-saturated colors",
  "human faces or portraits hanging on walls",
  "framed photographs of people on walls",
  "family portraits or paintings of faces",
  "eerie or unsettling imagery anywhere in the room",
  "religious icons or crosses (unless specified)",
  "dim horror-movie lighting",
];

// ── Cultural incompatibility rules ───────────────────────────────────────

function getCulturalForbidden(schema: RoomSchema): string[] {
  const forbidden: string[] = [];
  const music = schema.atmosphere.music?.toLowerCase() ?? "";

  if (music.includes("flamenco") || music.includes("reggaeton") || music.includes("pop español")) {
    forbidden.push(
      "emo or goth room aesthetic",
      "dark oppressive atmosphere",
      "metal band posters",
      "heavy industrial look",
    );
  }

  if (schema.atmosphere.season === "summer") {
    forbidden.push("cold grey winter lighting", "dark oppressive atmosphere");
  }

  return forbidden;
}

// ── Main prompt builder ───────────────────────────────────────────────────

export function buildSpatialPrompt(
  room:          EnhancedRoom,
  schema:        RoomSchema,
  detectedYear:  number,
  temporalCtx:   string,
): string {
  const sections: string[] = [];

  // ── 1. Root declaration (style + anti-dramatization) ─────────────────
  sections.push(
    `Photorealistic documentary photograph of a real Spanish ${room.era} teenage bedroom in Spain. ` +
    `Shot on 35mm film, natural light balance, NO cinematic dramatization. ` +
    `FAITHFUL MEMORY RECONSTRUCTION — not an artistic interpretation. ` +
    `This is an ordinary room where a real person lived.`,
  );

  // ── 2. Spatial layout ─────────────────────────────────────────────────
  const spatial: string[] = [];
  if (schema.geometry.deskShape) {
    spatial.push(`${schema.geometry.deskShape}-shaped desk`);
  }
  if (schema.geometry.roomSize) {
    spatial.push(`${schema.geometry.roomSize} room`);
  }
  if (schema.windows.count) {
    spatial.push(`${schema.windows.count} window${schema.windows.count > 1 ? "s" : ""}`);
  }
  if (schema.windows.open) {
    spatial.push(`window is OPEN${schema.windows.hasBlind ? ", with venetian blind half-closed" : ""}`);
  }
  if (schema.furniture.desk?.position) {
    spatial.push(`desk positioned ${schema.furniture.desk.position}`);
  }
  if (spatial.length > 0) {
    sections.push(`SPATIAL LAYOUT: ${spatial.join(", ")}.`);
  }

  // ── 3. Wall configuration ─────────────────────────────────────────────
  const wallParts: string[] = [];
  if (schema.walls.color) {
    wallParts.push(
      `ALL walls MUST be painted ${schema.walls.color} — this is critical, do not change wall color`,
    );
  }
  if (!schema.walls.postersAllowed) {
    wallParts.push(
      `WALLS ARE BARE AND CLEAN — ABSOLUTELY NO posters, NO photos, NO decorations, NO stickers on any wall surface`,
    );
  } else if (schema.walls.decorations && schema.walls.decorations.length > 0) {
    wallParts.push(`wall decorations: ${schema.walls.decorations.join(", ")} only`);
  }
  if (wallParts.length > 0) {
    sections.push(`WALLS: ${wallParts.join(". ")}.`);
  }

  // ── 4. Furniture ─────────────────────────────────────────────────────
  const furniture: string[] = [];
  if (schema.furniture.desk) {
    const d = schema.furniture.desk;
    const deskStr = [d.shape ? `${d.shape}-shaped` : "", "desk", d.material ?? "", d.position ? `(${d.position})` : ""]
      .filter(Boolean)
      .join(" ");
    furniture.push(deskStr);
  }
  if (schema.furniture.bed) {
    furniture.push(`bed${schema.furniture.bed.type ? ` (${schema.furniture.bed.type})` : ""}`);
  }
  if (schema.furniture.chair?.color) {
    furniture.push(`office chair with ${schema.furniture.chair.color} color — exact color is important`);
  } else if (schema.furniture.chair) {
    furniture.push("office chair");
  }
  if (schema.furniture.shelves?.present) {
    furniture.push(`shelves${schema.furniture.shelves.contents ? ` with ${schema.furniture.shelves.contents}` : ""}`);
  }
  if (furniture.length > 0) {
    sections.push(`FURNITURE: ${furniture.join(", ")}.`);
  }

  // ── 5. Computer / technology ──────────────────────────────────────────
  if (schema.computer.present) {
    const tech: string[] = [];
    if (schema.computer.monitorType === "crt") tech.push("CRT monitor (thick, curved screen)");
    else if (schema.computer.monitorType === "flat") tech.push("flat screen monitor");
    else if (schema.computer.monitorType === "laptop") tech.push("laptop computer");

    if (schema.computer.messengerOpen) {
      tech.push("MSN Messenger open and visible on screen, contacts list showing");
    }
    if (schema.computer.programs && schema.computer.programs.length > 0) {
      tech.push(`screen showing: ${schema.computer.programs.join(", ")}`);
    }
    if (tech.length > 0) {
      sections.push(`COMPUTER: ${tech.join(", ")}.`);
    }
  }

  // ── 6. Lighting ───────────────────────────────────────────────────────
  const lighting: string[] = [];
  if (schema.lighting.bright) {
    lighting.push("BRIGHT WELL-LIT ROOM — no dark shadows, full daylight, no moody darkness");
  }
  if (schema.lighting.timeOfDay) lighting.push(schema.lighting.timeOfDay);
  if (schema.lighting.natural && schema.windows.open) {
    lighting.push("natural daylight flooding in through open window");
  }
  if (schema.lighting.quality) lighting.push(schema.lighting.quality);

  // Fallback lighting from room atmosphere
  if (lighting.length === 0 && room.atmosphere?.lightingProfile) {
    const LIGHTING_DESC: Record<string, string> = {
      warm_lamp_glow:    "warm incandescent desk lamp, golden light",
      cold_blue_monitor: "cold CRT monitor glow as main light source",
      crt_amber:         "amber CRT warmth, soft scanline light",
      darkness_screen:   "room nearly dark, only monitor light",
      afternoon_sun:     "late afternoon sunlight through half-closed blinds",
    };
    const desc = LIGHTING_DESC[room.atmosphere.lightingProfile];
    if (desc) lighting.push(desc);
  }
  if (lighting.length > 0) {
    sections.push(`LIGHTING: ${lighting.join(", ")}.`);
  }

  // ── 7. Cultural atmosphere ────────────────────────────────────────────
  const atmos: string[] = [];
  if (schema.atmosphere.music) {
    atmos.push(`background music: ${schema.atmosphere.music} (NOT visually represented, just mood)`);
  }
  if (schema.atmosphere.season === "summer") {
    atmos.push("warm summer heat, Spanish Mediterranean atmosphere");
  }
  if (atmos.length > 0) {
    sections.push(`ATMOSPHERE: ${atmos.join(". ")}.`);
  }

  // ── 8. Temporal + cultural context ───────────────────────────────────
  const spatialRel = deriveSpatialRelationships(schema);
  sections.push(`SPATIAL & CAMERA: ${buildSpatialFragment(spatialRel)}`);

  sections.push(buildCulturalDetailFragment(schema, detectedYear, room.imperfectionLevel));

  sections.push(
    `Spain, year ${detectedYear}. Middle-class apartment. ` +
    `Spanish domestic furniture (brown wood, IKEA equivalents). ` +
    temporalCtx,
  );

  // ── 9. WHITELIST — complete room inventory ────────────────────────────
  // DALL-E 3 respects whitelists better than blacklists.
  // Enumerate every object that should exist. Nothing else is allowed.
  const inventoryItems: string[] = [...schema.explicitlyMentioned];

  if (schema.furniture.desk) {
    const d = schema.furniture.desk;
    inventoryItems.push(
      `${d.shape ? d.shape + "-shaped " : ""}wooden desk${d.position ? " (" + d.position + ")" : ""}`,
    );
  }
  if (schema.furniture.chair) {
    inventoryItems.push(
      `ONE single ${schema.furniture.chair.color ? schema.furniture.chair.color + " " : ""}office chair`,
    );
  }
  if (schema.furniture.bed) inventoryItems.push("bed");
  if (schema.computer.present) {
    inventoryItems.push(
      schema.computer.monitorType === "crt" ? "CRT monitor on desk" : "computer monitor on desk",
    );
  }
  if (schema.windows.open) {
    inventoryItems.push(`open window${schema.windows.hasBlind ? " with venetian blind" : ""}`);
  }

  const uniqueInventory = [...new Set(inventoryItems)].filter(Boolean);

  if (uniqueInventory.length > 0) {
    sections.push(
      `COMPLETE ROOM INVENTORY — only these items exist, nothing else: ${uniqueInventory.join(" | ")}. ` +
      `Do NOT invent or add any object, plant, lamp, photo, decoration, or furniture not in this list.`,
    );
  }

  // ── 10. Hard negative constraints ─────────────────────────────────────
  const allForbidden = [
    ...(!schema.walls.postersAllowed
      ? ["posters", "photos on walls", "portraits on walls", "photo collages", "stickers on walls", "wall art"]
      : []),
    "multiple chairs — only ONE chair is allowed",
    "plants or flowers (not mentioned by user)",
    "desk lamps (not mentioned by user)",
    "extra decorative objects not in the inventory",
    ...getCulturalForbidden(schema),
    ...schema.forbiddenElements,
    ...UNIVERSAL_FORBIDDEN,
  ];

  const uniqueForbidden = [...new Set(allForbidden)];

  sections.push(
    `ABSOLUTELY DO NOT ADD: ${uniqueForbidden.join("; ")}.`,
  );

  // ── 11. Authenticity directive ────────────────────────────────────────
  sections.push(
    `IMPORTANT: This room is simple, lived-in, and completely ordinary. ` +
    `A real Spanish teenager lived here — it is NOT dramatic, NOT aesthetic, NOT cinematic. ` +
    `The nostalgia comes from ACCURACY and familiarity, not from visual spectacle. ` +
    `Perspective: slightly elevated corner view showing full room. ` +
    `Style: documentary photography, NOT editorial.`,
  );

  return sections.join("\n\n").slice(0, 3900);
}
