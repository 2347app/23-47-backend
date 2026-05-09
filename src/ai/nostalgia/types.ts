// =====================================================
// 23:47 — Nostalgia Room Reconstruction Pipeline
// Types for all 7 engines
// =====================================================

export type LightingProfile =
  | "cold_blue_monitor"
  | "warm_lamp_glow"
  | "crt_amber"
  | "mixed_ambient"
  | "darkness_screen"
  | "afternoon_sun";

export type Zone =
  | "sleep_zone"
  | "gaming_zone"
  | "music_zone"
  | "computer_zone"
  | "poster_zone"
  | "window_zone"
  | "floor_zone";

// ── Phase 1: Semantic Parser output ──────────────────────────────────────────
export interface SemanticProfile {
  era: string;
  personality: string;
  musicIdentity: string;
  roomEnergy: string;
  socialIdentity: string;
  lightingProfile: LightingProfile;
  emotionalDensity: "low" | "medium" | "high";
  visualNoise: "minimal" | "medium" | "chaotic";
  comfortLevel: string;
  culturalMarkers: string[];
  timePattern: "day" | "evening" | "night" | "late_night";
}

// ── Phase 2: Identity Reconstruction output ───────────────────────────────────
export interface IdentityProfile {
  archetypes: string[];
  lifestyle: string;
  isNocturnal: boolean;
  socialPattern: "isolated" | "connected" | "mixed";
  decade: string;
  emotionalTone: string;
  emotionalAnchor: string;
}

// ── Phase 3: Nostalgia Ontology ───────────────────────────────────────────────
export interface OntologyObject {
  id: string;
  type: string;
  label: string;
  zone: Zone;
  companions: string[];
  emotionalWeight: number;
  narrativeRole: string;
  culturalEra: string[];
}

// ── Phase 4: Spatial Narrative ────────────────────────────────────────────────
export interface SpatialObject {
  type: string;
  label: string;
  zone: Zone;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  depth: number;
  emotionalWeight: number;
  metadata: {
    zone: Zone;
    emotionalWeight: number;
    depth: number;
    narrativeRole: string;
    label: string;
    imperfection: {
      blurAmount: number;
      shadowOpacity: number;
    };
  };
}

// ── Phase 5+6: Atmosphere + Imperfection ─────────────────────────────────────
export interface AtmosphereProfile {
  lightingProfile: LightingProfile;
  ambientType: string;
  colorTemperature: number;
  crtGrain: boolean;
  monitorGlow: boolean;
  depthFog: boolean;
  timeOfDay: "afternoon" | "evening" | "night" | "late_night";
  emotionalHaze: number;
  breathingSpeed: number;
  vignette: number;
  contrast: number;
}

// ── Final output ──────────────────────────────────────────────────────────────
export interface EnhancedRoom {
  era: string;
  identity: IdentityProfile;
  atmosphere: AtmosphereProfile;
  description: string;
  narrativeMoment: string;
  ambient: string;
  background: string;
  musicTheme: string;
  items: SpatialObject[];
  imperfectionLevel: number;
}
