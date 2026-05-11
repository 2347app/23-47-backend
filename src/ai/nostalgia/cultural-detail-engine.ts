// ============================================================
// 23:47 — Cultural Detail Injection Engine
// Injects authentic Spanish 2000-2010 micro-details into DALL-E prompts.
// The nostalgia comes from accuracy, not from clichés.
// ============================================================

import type { RoomSchema } from "./room-schema-engine";

interface CulturalDetailPack {
  architecture:    string[];
  objects:         string[];
  technology:      string[];
  lighting:        string[];
  msn?:            string;
  imperfections:   string[];
}

// ── Era-specific cultural packs ───────────────────────────────────────────

const SPAIN_2000_2010: CulturalDetailPack = {
  architecture: [
    "white PVC window frame",
    "thin aluminum venetian blind (persiana)",
    "white painted walls (slightly yellowed near ceiling)",
    "beige or light parquet laminate floor",
    "white radiator on wall below window",
    "visible door frame with simple handle",
  ],
  objects: [
    "stack of CD-Rs with handwritten labels in marker",
    "cheap rectangular mousepad",
    "PS/2 keyboard (grey, worn keys)",
    "beige or dark tower PC case on floor beside desk",
    "small cheap speakers (Logitech or Creative brand, black plastic)",
    "printed school notes scattered on desk corner",
  ],
  technology: [
    "CRT monitor with slight screen curvature and visible refresh lines",
    "Windows XP taskbar visible at bottom of screen",
    "Logitech webcam clipped to top of CRT",
    "Sony Ericsson or Nokia phone charging on desk corner",
  ],
  lighting: [
    "warm incandescent light from cheap ceiling fixture",
    "Mediterranean quality light — slightly warm, slightly dusty",
  ],
  msn: [
    "MSN Messenger 7.5 interface clearly visible on screen:",
    "blue title bar reading 'MSN Messenger', butterfly logo top-left",
    "contact list with green online dot icons and usernames with emoticons",
    "white chat window open in foreground with typed messages visible",
    "status bar showing 'Online' in bottom-left of window",
  ].join(" "),
  imperfections: [
    "chair slightly angled, not perfectly straight",
    "one CD case open on desk edge",
    "cable from tower PC loosely coiled on floor",
    "desk surface has faint ring marks from glasses",
  ],
};

const SPAIN_1995_2000: CulturalDetailPack = {
  architecture: [
    "wooden window frame (darker wood tone)",
    "wallpaper with subtle pattern OR simple painted plaster",
    "patterned ceramic tile floor (Spanish mosaic)",
    "cast iron or painted steel radiator",
  ],
  objects: [
    "VHS tapes stacked on shelf",
    "Game Boy or Walkman on desk",
    "printed encyclopedia volumes on shelf",
    "football sticker album partially visible",
  ],
  technology: [
    "older CRT monitor (thicker, rounded edges)",
    "Windows 95/98 desktop visible if computer present",
    "dial-up modem box visible near computer",
  ],
  lighting: [
    "warm tungsten light",
    "slightly bluish daylight from window in contrast",
  ],
  imperfections: [
    "loose papers on desk",
    "pencil case open",
    "worn desk surface from years of use",
  ],
};

const SPAIN_2010_2015: CulturalDetailPack = {
  architecture: [
    "modern white PVC frame, double-glazed window",
    "light grey or white painted walls",
    "light oak or white laminate floor",
  ],
  objects: [
    "iPhone or Android phone charging on desk",
    "headphones on desk or hanging from monitor",
    "energy drink can (Monster or Burn)",
  ],
  technology: [
    "flat screen LCD monitor",
    "laptop partially open beside desktop",
    "HDMI or USB cables on desk",
  ],
  lighting: [
    "LED desk lamp",
    "cooler natural daylight from low-emissivity window",
  ],
  imperfections: [
    "headphone cable slightly tangled",
    "sticky notes on monitor bezel",
  ],
};

// ── Cultural markers modifier ─────────────────────────────────────────────

function getMarkerDetails(schema: RoomSchema): string[] {
  const extras: string[] = [];
  const music = schema.atmosphere.music?.toLowerCase() ?? "";

  if (music.includes("flamenco")) {
    extras.push("warm late-afternoon Mediterranean light quality");
    extras.push("sense of summer heat — window open to let air circulate");
  }
  if (music.includes("rock") || music.includes("metal")) {
    extras.push("darker corner mood, monitor as primary light focus");
  }
  if (schema.atmosphere.season === "summer") {
    extras.push("slight heat haze quality to the light");
    extras.push("persiana half-closed to keep out afternoon sun");
  }
  if (schema.computer.messengerOpen) {
    extras.push("blue MSN Messenger interface glow reflected on nearby surfaces");
  }

  return extras;
}

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

  // Architecture — always inject 2-3 period-accurate architectural details
  const archSample = pack.architecture.slice(0, 3);
  parts.push(`ARCHITECTURAL DETAILS: ${archSample.join(", ")}`);

  // Technology context
  if (schema.computer.present && pack.technology.length > 0) {
    parts.push(`TECHNOLOGY DETAILS: ${pack.technology.slice(0, 2).join(", ")}`);
  }

  // MSN Messenger — specific visual instructions
  if (schema.computer.messengerOpen && pack.msn) {
    parts.push(`MSN MESSENGER INTERFACE: ${pack.msn}`);
  }

  // Cultural objects (1-2 only, not overwhelming)
  const objSample = pack.objects.slice(0, 2);
  parts.push(`PERIOD OBJECTS (subtle, not dominant): ${objSample.join(", ")}`);

  // Marker-specific details
  const markerDetails = getMarkerDetails(schema);
  if (markerDetails.length > 0) {
    parts.push(`CULTURAL ATMOSPHERE: ${markerDetails.join(", ")}`);
  }

  // Human imperfection — controlled by level (0.0 = perfect, 1.0 = very lived-in)
  if (imperfectionLevel > 0.3) {
    const imperfSample = pack.imperfections.slice(
      0,
      imperfectionLevel > 0.7 ? 3 : 2,
    );
    parts.push(
      `HUMAN IMPERFECTION (subtle, NOT chaotic): ${imperfSample.join(", ")}. ` +
      `These are signs of real habitation, NOT artistic clutter.`,
    );
  }

  return parts.join("\n");
}
