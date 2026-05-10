// =====================================================
// Phase 3 — Nostalgia Ontology Engine
// Cultural knowledge base: objects don't exist in
// isolation — they belong to the same universe.
// PS2 → CRT → cables → game cases → carpet stains.
// =====================================================

import type { OntologyObject, Zone } from "./types";

const OBJECT_DB: OntologyObject[] = [
  // ── Computer zone ────────────────────────────────────────────────────────────
  {
    id: "crt_monitor",
    type: "crt",
    label: "Monitor CRT encendido",
    zone: "computer_zone",
    companions: ["keyboard_desk", "desk_lamp", "polaroid_photos"],
    emotionalWeight: 0.95,
    narrativeRole: "digital_portal",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006"],
  },
  {
    id: "keyboard_desk",
    type: "computer",
    label: "Teclado con cables enredados",
    zone: "computer_zone",
    companions: ["crt_monitor", "desk_lamp"],
    emotionalWeight: 0.65,
    narrativeRole: "communication_interface",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007"],
  },
  {
    id: "desk_lamp",
    type: "lamp",
    label: "Lámpara de escritorio inclinada",
    zone: "computer_zone",
    companions: ["crt_monitor", "keyboard_desk"],
    emotionalWeight: 0.50,
    narrativeRole: "atmospheric_light",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008"],
  },

  // ── Gaming zone ───────────────────────────────────────────────────────────────
  {
    id: "ps2_console",
    type: "console",
    label: "PlayStation 2 conectada al televisor",
    zone: "gaming_zone",
    companions: ["game_cases", "crt_tv"],
    emotionalWeight: 0.90,
    narrativeRole: "escape_portal",
    culturalEra: ["2001", "2002", "2003", "2004", "2005", "2006"],
  },
  {
    id: "game_cases",
    type: "console",
    label: "Cajas de juegos apiladas sin orden",
    zone: "gaming_zone",
    companions: ["ps2_console"],
    emotionalWeight: 0.60,
    narrativeRole: "collection_chaos",
    culturalEra: ["2001", "2002", "2003", "2004", "2005", "2006"],
  },
  {
    id: "crt_tv",
    type: "crt",
    label: "Televisor CRT de tubo",
    zone: "gaming_zone",
    companions: ["ps2_console"],
    emotionalWeight: 0.75,
    narrativeRole: "analog_screen",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005"],
  },

  // ── Poster zone ───────────────────────────────────────────────────────────────
  {
    id: "poster_band",
    type: "poster",
    label: "Póster de banda ligeramente torcido",
    zone: "poster_zone",
    companions: ["magazine_cutouts"],
    emotionalWeight: 0.80,
    narrativeRole: "identity_declaration",
    culturalEra: ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008"],
  },
  {
    id: "magazine_cutouts",
    type: "photo",
    label: "Recortes de revista pegados con celo",
    zone: "poster_zone",
    companions: ["poster_band"],
    emotionalWeight: 0.55,
    narrativeRole: "teen_aspiration",
    culturalEra: ["2001", "2002", "2003", "2004", "2005"],
  },
  {
    id: "polaroid_photos",
    type: "photo",
    label: "Fotos polaroid en el borde del espejo",
    zone: "poster_zone",
    companions: ["msn_messenger"],
    emotionalWeight: 0.70,
    narrativeRole: "real_connections_preserved",
    culturalEra: ["2003", "2004", "2005", "2006", "2007", "2008"],
  },

  // ── Music zone ────────────────────────────────────────────────────────────────
  {
    id: "cd_stack",
    type: "vinyl",
    label: "CDs apilados sin caja",
    zone: "music_zone",
    companions: ["mp3_device"],
    emotionalWeight: 0.75,
    narrativeRole: "music_identity_physical",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006"],
  },
  {
    id: "mp3_device",
    type: "phone",
    label: "Reproductor MP3 con auriculares enredados",
    zone: "music_zone",
    companions: ["cd_stack"],
    emotionalWeight: 0.65,
    narrativeRole: "sonic_escape_device",
    culturalEra: ["2003", "2004", "2005", "2006", "2007"],
  },

  // ── Sleep zone ────────────────────────────────────────────────────────────────
  {
    id: "bed_unmade",
    type: "bed",
    label: "Cama deshecha como prueba de vida",
    zone: "sleep_zone",
    companions: [],
    emotionalWeight: 0.60,
    narrativeRole: "lived_presence",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"],
  },

  // ── Objetos cultura material española 2000s ───────────────────────────────
  {
    id: "fan_white",
    type: "fan",
    label: "Ventilador blanco de pie girando",
    zone: "window_zone",
    companions: ["window_blind"],
    emotionalWeight: 0.85,
    narrativeRole: "summer_heat_indicator",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007"],
  },
  {
    id: "window_blind",
    type: "blind",
    label: "Persiana medio cerrada contra el calor",
    zone: "window_zone",
    companions: ["fan_white"],
    emotionalWeight: 0.70,
    narrativeRole: "heat_barrier",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008"],
  },
  {
    id: "nokia_phone",
    type: "nokia",
    label: "Nokia 3310 con funda de colores",
    zone: "music_zone",
    companions: ["cd_stack"],
    emotionalWeight: 0.88,
    narrativeRole: "social_tether",
    culturalEra: ["2001", "2002", "2003", "2004", "2005", "2006"],
  },
  {
    id: "ps2_slim",
    type: "ps2",
    label: "PlayStation 2 Slim negra",
    zone: "gaming_zone",
    companions: ["crt_tv", "game_cases"],
    emotionalWeight: 0.92,
    narrativeRole: "escape_portal_spanish",
    culturalEra: ["2004", "2005", "2006", "2007"],
  },
  {
    id: "walkman_aiwa",
    type: "walkman",
    label: "Walkman AIWA con cinta mezclada",
    zone: "music_zone",
    companions: ["cd_stack"],
    emotionalWeight: 0.78,
    narrativeRole: "portable_sonic_world",
    culturalEra: ["2000", "2001", "2002", "2003", "2004"],
  },
  {
    id: "gaming_magazine",
    type: "magazine",
    label: "Revista SuperJuegos con el CD de trucos",
    zone: "gaming_zone",
    companions: ["ps2_console", "game_cases"],
    emotionalWeight: 0.65,
    narrativeRole: "knowledge_before_internet",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005"],
  },
  {
    id: "school_pencil_case",
    type: "pencil_case",
    label: "Estuche escolar tirado encima de la mochila",
    zone: "computer_zone",
    companions: ["keyboard_desk"],
    emotionalWeight: 0.55,
    narrativeRole: "real_world_intrusion",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007"],
  },
  {
    id: "cd_stack_labeled",
    type: "cd_stack",
    label: "CDs grabados con rotulador: 'MP3 Mix Vol.3'",
    zone: "music_zone",
    companions: ["cd_stack", "mp3_device"],
    emotionalWeight: 0.82,
    narrativeRole: "pirated_culture_artifact",
    culturalEra: ["2002", "2003", "2004", "2005", "2006", "2007"],
  },

  // ── Window zone ───────────────────────────────────────────────────────────────
  {
    id: "window_night",
    type: "window",
    label: "Ventana oscura. El exterior no importa.",
    zone: "window_zone",
    companions: ["dusty_plant"],
    emotionalWeight: 0.55,
    narrativeRole: "outside_world_excluded",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"],
  },
  {
    id: "dusty_plant",
    type: "plant",
    label: "Planta polvorienta casi olvidada",
    zone: "window_zone",
    companions: ["window_night"],
    emotionalWeight: 0.30,
    narrativeRole: "neglected_organic_life",
    culturalEra: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009"],
  },
];

// Cultural marker → which objects naturally appear
const MARKER_TO_OBJECTS: Record<string, string[]> = {
  ps2:                 ["ps2_console", "game_cases", "crt_tv"],
  ps1:                 ["ps2_console", "game_cases", "crt_tv"],
  msn_messenger:       ["crt_monitor", "keyboard_desk", "polaroid_photos"],
  linkin_park:         ["poster_band", "cd_stack", "mp3_device"],
  avril_lavigne:       ["poster_band", "magazine_cutouts", "cd_stack"],
  my_chemical_romance: ["poster_band", "cd_stack"],
  pes:                 ["ps2_console", "game_cases", "crt_tv"],
  winamp:              ["mp3_device", "cd_stack", "crt_monitor"],
  myspace:             ["crt_monitor", "polaroid_photos", "keyboard_desk"],
  pc_gaming:           ["crt_monitor", "keyboard_desk", "desk_lamp"],
  mp3_player:          ["mp3_device", "cd_stack"],
  cd_collection:       ["cd_stack", "poster_band"],
  counter_strike:      ["crt_monitor", "keyboard_desk", "desk_lamp"],
  habbo_hotel:         ["crt_monitor", "keyboard_desk"],
  tuenti:              ["crt_monitor", "polaroid_photos", "keyboard_desk"],
  forum_user:          ["crt_monitor", "keyboard_desk", "desk_lamp"],
  p2p_music:           ["mp3_device", "cd_stack", "crt_monitor"],
  crt_monitor:         ["crt_monitor", "desk_lamp", "keyboard_desk"],
  // ── Marcadores españoles 2000s ────────────────────────────────────────────
  nokia:               ["nokia_phone", "cd_stack"],
  nokia_3310:          ["nokia_phone"],
  fondo_flamenco:      ["fan_white", "window_blind", "cd_stack"],
  verano_sur:          ["fan_white", "window_blind"],
  ventilador:          ["fan_white", "window_blind"],
  persiana:            ["window_blind", "fan_white"],
  superjuegos:         ["gaming_magazine", "ps2_console", "game_cases"],
  hobby_consolas:      ["gaming_magazine", "ps2_console"],
  walkman:             ["walkman_aiwa", "cd_stack"],
  casete:              ["walkman_aiwa"],
  emule:               ["crt_monitor", "cd_stack_labeled", "keyboard_desk"],
  fotolog:             ["crt_monitor", "polaroid_photos", "keyboard_desk"],
  pes_5:               ["ps2_slim", "crt_tv", "game_cases"],
  pes_6:               ["ps2_slim", "crt_tv", "game_cases"],
  gta_san_andreas:     ["ps2_slim", "crt_tv", "game_cases"],
  estuche:             ["school_pencil_case", "keyboard_desk"],
  cd_grabados:         ["cd_stack_labeled", "cd_stack", "mp3_device"],
  messenger:           ["crt_monitor", "keyboard_desk", "polaroid_photos"],
  el_internado:        ["crt_tv", "bed_unmade", "poster_band"],
  operacion_triunfo:   ["crt_tv", "cd_stack", "poster_band"],
};

const UNIVERSAL_FALLBACK = ["bed_unmade", "window_night", "dusty_plant"];

export function selectOntologyObjects(
  markers: string[],
  emotionalDensity: "low" | "medium" | "high"
): OntologyObject[] {
  const selectedIds = new Set<string>();

  for (const marker of markers) {
    (MARKER_TO_OBJECTS[marker] ?? []).forEach((id) => selectedIds.add(id));
  }

  // Always include some universal grounding objects
  const universalCount =
    emotionalDensity === "low" ? 1 : emotionalDensity === "medium" ? 2 : 3;
  UNIVERSAL_FALLBACK.slice(0, universalCount).forEach((id) => selectedIds.add(id));

  // Fallback if nothing matched
  if (selectedIds.size === 0) {
    ["crt_monitor", "keyboard_desk", "poster_band", "bed_unmade"].forEach((id) =>
      selectedIds.add(id)
    );
  }

  return Array.from(selectedIds)
    .map((id) => OBJECT_DB.find((o) => o.id === id))
    .filter((o): o is OntologyObject => o !== undefined)
    .sort((a, b) => b.emotionalWeight - a.emotionalWeight)
    .slice(0, 9);
}
