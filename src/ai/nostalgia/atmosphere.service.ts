// =====================================================
// Phase 5+6 — Atmospheric Life Engine +
//              Memory Imperfection System
// The room breathes. The memory is not perfect.
// =====================================================

import type { SemanticProfile, IdentityProfile, AtmosphereProfile, LightingProfile } from "./types";

const LIGHTING_TO_AMBIENT: Record<LightingProfile, string> = {
  cold_blue_monitor: "crt",
  warm_lamp_glow:    "warm",
  crt_amber:         "crt",
  mixed_ambient:     "calm",
  darkness_screen:   "neon",
  afternoon_sun:     "calm",
};

// Color temperature in Kelvin — drives CSS filter calculations on frontend
const LIGHTING_COLOR_TEMP: Record<LightingProfile, number> = {
  cold_blue_monitor: 4400,
  warm_lamp_glow:    3000,
  crt_amber:         3600,
  mixed_ambient:     3800,
  darkness_screen:   5200,
  afternoon_sun:     5800,
};

export function buildAtmosphere(
  semantic: SemanticProfile,
  identity: IdentityProfile
): AtmosphereProfile {
  const { lightingProfile, emotionalDensity, culturalMarkers, timePattern } = semantic;

  const isNight =
    identity.isNocturnal ||
    timePattern === "night" ||
    timePattern === "late_night";

  const isMonitorDriven =
    lightingProfile === "cold_blue_monitor" ||
    lightingProfile === "darkness_screen";

  const hasMonitor =
    isMonitorDriven ||
    culturalMarkers.some((m) =>
      ["msn_messenger", "pc_gaming", "crt_monitor", "forum_user", "counter_strike"].includes(m)
    );

  const hasCrt =
    hasMonitor ||
    culturalMarkers.some((m) => ["ps2", "ps1", "crt_tv"].includes(m));

  // Emotional haze: how dreamlike/imperfect the memory feels (0–1)
  const emotionalHaze =
    emotionalDensity === "high" ? 0.38 :
    emotionalDensity === "medium" ? 0.22 :
    0.10;

  // Breathing speed: ambient animation pulse rate (lower = slower/sadder)
  const breathingSpeed = isNight ? 0.55 : identity.socialPattern === "isolated" ? 0.70 : 0.90;

  const timeOfDay: AtmosphereProfile["timeOfDay"] =
    timePattern === "day" ? "afternoon" :
    timePattern === "evening" ? "evening" :
    timePattern === "night" ? "night" :
    "late_night";

  // Vignette strength: night + high emotion = more vignette
  const vignette =
    isNight ? 0.60 + (emotionalDensity === "high" ? 0.12 : 0) :
    0.30;

  // Contrast boost for monitor-lit scenes
  const contrast = isMonitorDriven ? 1.18 : isNight ? 1.10 : 1.00;

  return {
    lightingProfile,
    ambientType: LIGHTING_TO_AMBIENT[lightingProfile] ?? "calm",
    colorTemperature: LIGHTING_COLOR_TEMP[lightingProfile] ?? 4000,
    crtGrain:    hasCrt,
    monitorGlow: hasMonitor,
    depthFog:    isNight || semantic.visualNoise === "minimal",
    timeOfDay,
    emotionalHaze,
    breathingSpeed,
    vignette,
    contrast,
  };
}

// How imperfect/dreamlike the memory reconstruction should be (0–1)
export function calculateImperfectionLevel(
  semantic: SemanticProfile,
  identity: IdentityProfile
): number {
  const densityBase =
    semantic.emotionalDensity === "high" ? 0.68 :
    semantic.emotionalDensity === "medium" ? 0.44 :
    0.24;

  const nightBonus    = identity.isNocturnal ? 0.14 : 0;
  const isolatedBonus = identity.socialPattern === "isolated" ? 0.08 : 0;

  return Math.min(0.95, densityBase + nightBonus + isolatedBonus);
}
