// ============================================================
// 23:47 — Spatial Relationship Engine
// Derives emotional spatial relationships from RoomSchema.
// The composition emerges from the remembered space — not from AI aesthetics.
// ============================================================

import type { RoomSchema } from "./room-schema-engine";

export interface SpatialRelationships {
  lightDirection:  "top_left" | "top_right" | "top_center" | "indirect_diffuse";
  lightQuality:    "sharp_sunlight" | "soft_diffuse" | "afternoon_warm" | "crt_night_glow";
  monitorReflections: {
    windowReflection: boolean;
    crtScanlines:     boolean;
    warmGlow:         boolean;
  };
  shadows: {
    direction:  "casts_right" | "casts_left" | "casts_behind" | "minimal";
    softness:   "sharp" | "soft" | "very_soft";
    deskShadow: boolean;
  };
  camera: {
    viewpoint:     "corner_left" | "corner_right" | "doorway_entry" | "bed_looking_desk";
    eyeLevel:      "seated_teen" | "standing" | "low_dramatic";
    focalAxis:     "monitor_window" | "desk_center" | "full_room_sweep";
    emotionalAnchor: string;
  };
  roomFeeling: {
    depthFeel:   "intimate_small" | "medium_lived" | "open_spacious";
    airQuality:  "mediterranean_summer" | "winter_cold" | "neutral_interior";
    timeFeeling: string;
  };
}

// ── Derive spatial relationships from the room schema ────────────────────

export function deriveSpatialRelationships(schema: RoomSchema): SpatialRelationships {
  const hasCRT      = schema.computer.monitorType === "crt";
  const isNight     = /night|2am|madrugada/.test(schema.lighting.timeOfDay ?? "");
  const isBright    = schema.lighting.bright === true;
  const deskUnderWin = /under window|bajo ventana|debajo/.test(schema.furniture.desk?.position ?? "");
  const windowOpen  = schema.windows.open === true;

  // ── Light direction ─────────────────────────────────────────────────
  let lightDirection: SpatialRelationships["lightDirection"] = "top_left";
  if (deskUnderWin && windowOpen) {
    lightDirection = "top_center";
  } else if (schema.windows.position === "right_wall") {
    lightDirection = "top_right";
  } else if (schema.windows.position === "left_wall") {
    lightDirection = "top_left";
  } else if (!windowOpen) {
    lightDirection = "indirect_diffuse";
  }

  // ── Light quality ───────────────────────────────────────────────────
  let lightQuality: SpatialRelationships["lightQuality"];
  if (isNight && hasCRT) {
    lightQuality = "crt_night_glow";
  } else if (isBright && schema.atmosphere.season === "summer") {
    lightQuality = "afternoon_warm";
  } else if (isBright) {
    lightQuality = "sharp_sunlight";
  } else {
    lightQuality = "soft_diffuse";
  }

  // ── Shadow behavior ─────────────────────────────────────────────────
  const shadowDir: SpatialRelationships["shadows"]["direction"] =
    lightDirection === "top_left"   ? "casts_right"  :
    lightDirection === "top_right"  ? "casts_left"   :
    lightDirection === "top_center" ? "casts_behind" :
    "minimal";

  const shadowSoftness: SpatialRelationships["shadows"]["softness"] =
    lightQuality === "sharp_sunlight"  ? "sharp"     :
    lightQuality === "afternoon_warm"  ? "very_soft" :
    "soft";

  // ── Camera / emotional perspective ─────────────────────────────────
  // The most emotionally authentic Spanish teenage room perspective:
  // corner of the room, seated at desk height, looking towards monitor+window
  const focalAxis: SpatialRelationships["camera"]["focalAxis"] =
    (schema.computer.present && windowOpen) ? "monitor_window" :
    schema.furniture.desk                   ? "desk_center"    :
    "full_room_sweep";

  const emotionalAnchor =
    schema.computer.messengerOpen
      ? "the CRT monitor glow is the emotional heart of the room — Messenger interface is the memory"
      : windowOpen && isBright
      ? "the open window with natural light defines the emotional atmosphere"
      : schema.atmosphere.music?.includes("flamenco")
      ? "warm Mediterranean afternoon light and music from another room define the mood"
      : "the desk with personal objects is the emotional center of the space";

  // ── Room feeling ────────────────────────────────────────────────────
  const airQuality: SpatialRelationships["roomFeeling"]["airQuality"] =
    schema.atmosphere.season === "summer" ? "mediterranean_summer" :
    schema.atmosphere.season === "winter" ? "winter_cold" :
    "neutral_interior";

  const timeFeeling =
    lightQuality === "crt_night_glow" ? "late night solitude, only the screen exists" :
    lightQuality === "afternoon_warm" ? "warm lazy Spanish afternoon, time feels slow" :
    isBright                          ? "bright ordinary day, life is happening normally" :
    "quiet interior moment, a teenager alone with their world";

  return {
    lightDirection,
    lightQuality,
    monitorReflections: {
      windowReflection: hasCRT && windowOpen && !isNight,
      crtScanlines:     hasCRT,
      warmGlow:         hasCRT && !isNight,
    },
    shadows: {
      direction:  shadowDir,
      softness:   shadowSoftness,
      deskShadow: !!schema.furniture.desk,
    },
    camera: {
      viewpoint:      "corner_left",
      eyeLevel:       "seated_teen",
      focalAxis,
      emotionalAnchor,
    },
    roomFeeling: {
      depthFeel:   "intimate_small",
      airQuality,
      timeFeeling,
    },
  };
}

// ── Build spatial section for DALL-E prompt ───────────────────────────────

export function buildSpatialFragment(spatial: SpatialRelationships): string {
  const parts: string[] = [];

  const LIGHT_DESCS: Record<string, string> = {
    top_left:        "natural light enters top-left, warm diagonal rays, soft shadows cast to the right",
    top_right:       "natural light enters top-right, shadows fall leftward",
    top_center:      "window directly above the desk, light falls vertically over the work surface",
    indirect_diffuse: "soft diffuse interior light, no harsh shadows, even flat illumination",
  };
  parts.push(LIGHT_DESCS[spatial.lightDirection]);

  const QUALITY_DESCS: Record<string, string> = {
    sharp_sunlight:   "sharp Spanish sunlight, high contrast, defined shadow edges",
    soft_diffuse:     "soft overcast light, gentle shadows, calm atmosphere",
    afternoon_warm:   "golden Mediterranean afternoon light, warm orange-yellow tone on surfaces",
    crt_night_glow:   "room in near darkness, CRT screen as sole light source, blue-white glow casting on face and desk",
  };
  parts.push(QUALITY_DESCS[spatial.lightQuality]);

  if (spatial.monitorReflections.windowReflection) {
    parts.push("faint window reflection visible on the curved CRT glass surface");
  }
  if (spatial.monitorReflections.crtScanlines) {
    parts.push("CRT screen shows subtle scanlines and slight barrel distortion");
  }
  if (spatial.shadows.deskShadow) {
    const SHADOW_DESCS: Record<string, string> = {
      casts_right:  "desk casts shadow to the right",
      casts_left:   "desk casts shadow to the left",
      casts_behind: "monitor and objects cast shadow behind and below",
      minimal:      "minimal shadows",
    };
    parts.push(SHADOW_DESCS[spatial.shadows.direction]);
  }

  const CAM_DESCS: Record<string, string> = {
    monitor_window: "CAMERA: corner of the room, low seated-teen eye level, looking diagonally toward the desk — monitor and window are simultaneously visible in frame",
    desk_center:    "CAMERA: room corner, eye level of a seated person, desk is the composition center",
    full_room_sweep: "CAMERA: doorway or corner, standing height, full room visible",
  };
  parts.push(CAM_DESCS[spatial.camera.focalAxis]);
  parts.push(`EMOTIONAL CORE: ${spatial.camera.emotionalAnchor}`);
  parts.push(`TIME FEELING: ${spatial.roomFeeling.timeFeeling}`);

  return parts.join(". ");
}
