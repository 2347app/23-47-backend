// ============================================================
// 23:47 — Cultural Detail Injection Engine
// Injects authentic Spanish 2000-2010 micro-details into DALL-E prompts.
// The nostalgia comes from accuracy, not from clichés.
// ============================================================

import type { RoomSchema } from "./room-schema-engine";

interface CulturalTexturePack {
  floorTexture:   string;
  wallTexture:    string;
  windowFrame:    string;
  lightQuality:   string;
  crtDescription: string;
  msn:            string;
  imperfections:  string[];
}

// ── Era-specific cultural packs ───────────────────────────────────────────

const SPAIN_2000_2010: CulturalTexturePack = {
  floorTexture:   "light beige laminate parquet floor, slightly worn in front of the desk",
  wallTexture:    "walls painted with matte interior latex, very slight paint imperfections near ceiling",
  windowFrame:    "white PVC window frame with simple hardware",
  lightQuality:   "Mediterranean interior: slightly warm colour temperature, soft natural light, no dramatic shadows",
  crtDescription: "CRT monitor with thick plastic bezel, slight screen curvature, visible scanlines, glass surface reflects faint window light",
  msn:            "MSN Messenger 7.5 on screen: blue header bar with butterfly logo, contact list with green online dots and usernames with emoticons, white chat window with conversation, Windows XP taskbar at bottom",
  imperfections:  [
    "chair positioned slightly off-angle from the desk",
    "desk surface shows faint marks from daily use",
    "keyboard slightly dusty between keys",
  ],
};

const SPAIN_1995_2000: CulturalTexturePack = {
  floorTexture:   "dark patterned ceramic mosaic tile floor, typical Spanish apartment",
  wallTexture:    "walls with subtle embossed wallpaper or flat painted plaster",
  windowFrame:    "dark wood or aluminum window frame",
  lightQuality:   "warm tungsten interior light, slight contrast with cooler daylight from window",
  crtDescription: "older CRT monitor with very thick rounded bezel, convex screen, dark plastic housing",
  msn:            "",
  imperfections:  [
    "chair legs slightly uneven",
    "desk surface worn at the centre",
    "keyboard visibly used",
  ],
};

const SPAIN_2010_2015: CulturalTexturePack = {
  floorTexture:   "light oak laminate floor, clean",
  wallTexture:    "smooth white or light grey painted walls",
  windowFrame:    "modern white PVC double-glazed window frame",
  lightQuality:   "cooler neutral daylight, clean interior light",
  crtDescription: "flat LCD monitor, thin bezel, matte screen",
  msn:            "",
  imperfections:  [
    "slight cable clutter behind the desk",
    "desk has minor surface marks",
    "monitor bezel slightly dusty",
  ],
};

// ── Cultural markers modifier ─────────────────────────────────────────────


// ── Main export ───────────────────────────────────────────────────────────

export function buildCulturalDetailFragment(
  schema: RoomSchema,
  detectedYear: number,
  imperfectionLevel: number = 0.5,
): string {
  const pack =
    detectedYear < 2000 ? SPAIN_1995_2000 :
    detectedYear < 2010 ? SPAIN_2000_2010 :
    SPAIN_2010_2015;

  const parts: string[] = [];

  // Surface textures only — describe HOW existing surfaces look, never add new objects
  parts.push(
    `SURFACE TEXTURES (background context only, do NOT add objects): ` +
    `floor: ${pack.floorTexture}. walls: ${pack.wallTexture}. window frame: ${pack.windowFrame}. ` +
    `light: ${pack.lightQuality}`,
  );

  // CRT detail — only if computer is present
  if (schema.computer.present && schema.computer.monitorType !== "flat") {
    parts.push(`CRT SCREEN APPEARANCE: ${pack.crtDescription}`);
  }

  // MSN — only if user explicitly mentioned Messenger
  if (schema.computer.messengerOpen && pack.msn) {
    parts.push(`MSN MESSENGER ON SCREEN (show this UI exactly): ${pack.msn}`);
  }

  // Open window — override any default closed/blind assumption
  if (schema.windows.open) {
    parts.push(
      `WINDOW IS OPEN: the window must be clearly open, outside visible through the glass. ` +
      `If a blind exists it is pulled UP or fully open. Do NOT show a closed or half-closed window.`,
    );
  }

  // Light atmosphere
  const music = schema.atmosphere.music?.toLowerCase() ?? "";
  if (music.includes("flamenco") || schema.atmosphere.season === "summer") {
    parts.push("LIGHT ATMOSPHERE: warm Mediterranean afternoon light, slightly hazy air, soft warm tone on surfaces");
  }

  // Human imperfection — only on already-mentioned objects
  if (imperfectionLevel > 0.3) {
    const items: string[] = [];
    if (schema.furniture.chair)  items.push(pack.imperfections[0]);
    if (schema.furniture.desk)   items.push(pack.imperfections[1]);
    if (schema.computer.present) items.push(pack.imperfections[2]);
    if (items.length > 0) {
      parts.push(`SUBTLE LIVED-IN DETAIL on existing objects only: ${items.join(", ")}`);
    }
  }

  return parts.join("\n");
}
