// =====================================================
// Phase 4 — Spatial Narrative Engine
// Objects don't float — they have weight, zone,
// narrative reason. The room must feel USED.
// =====================================================

import type { OntologyObject, IdentityProfile, SpatialObject, Zone } from "./types";

// Zone bounding boxes [xMin, xMax, yMin, yMax]
const ZONE_BOUNDS: Record<Zone, [number, number, number, number]> = {
  computer_zone: [15, 48, 38, 72],
  gaming_zone:   [38, 72, 52, 85],
  poster_zone:   [58, 96, 4,  44],
  music_zone:    [68, 96, 48, 80],
  sleep_zone:    [2,  32, 18, 52],
  window_zone:   [72, 98, 2,  28],
  floor_zone:    [8,  92, 82, 96],
};

// Depth layer per zone (lower = further back = render first)
const ZONE_DEPTH: Record<Zone, number> = {
  window_zone:   0,
  poster_zone:   1,
  sleep_zone:    2,
  computer_zone: 3,
  gaming_zone:   3,
  music_zone:    4,
  floor_zone:    5,
};

// Deterministic pseudo-random from index seed
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function rangeFromSeed(min: number, max: number, seed: number): number {
  return min + seededRand(seed) * (max - min);
}

function imperfectRotation(zone: Zone, idx: number): number {
  // Posters: slightly tilted. Floor: chaotic. Computer: almost straight.
  switch (zone) {
    case "poster_zone":   return rangeFromSeed(-9, 9, idx * 3.7) - 1;
    case "floor_zone":    return rangeFromSeed(-18, 18, idx * 5.3) - 9;
    case "sleep_zone":    return rangeFromSeed(-4, 4, idx * 2.1);
    case "window_zone":   return rangeFromSeed(-2, 2, idx * 1.3);
    case "music_zone":    return rangeFromSeed(-6, 6, idx * 4.1) - 2;
    default:              return rangeFromSeed(-4, 4, idx * 1.9) - 1;
  }
}

function imperfectScale(emotionalWeight: number, idx: number): number {
  // More emotionally important → larger, with slight jitter
  const base = 0.78 + emotionalWeight * 0.28;
  const jitter = rangeFromSeed(-0.07, 0.07, idx * 6.1);
  return Math.max(0.62, Math.min(1.28, base + jitter));
}

export function buildSpatialLayout(
  objects: OntologyObject[],
  _identity: IdentityProfile,
  imperfectionLevel: number
): SpatialObject[] {
  const zoneOccupancy = new Map<Zone, number>();
  const placed: SpatialObject[] = [];

  objects.forEach((obj, idx) => {
    const zone = obj.zone;
    const bounds = ZONE_BOUNDS[zone];
    const slotInZone = zoneOccupancy.get(zone) ?? 0;
    zoneOccupancy.set(zone, slotInZone + 1);

    // Spread multiple items within a zone without overlapping exactly
    const zoneWidth = bounds[1] - bounds[0];
    const xOffset = (slotInZone * (zoneWidth * 0.3)) % (zoneWidth * 0.6);

    const x = rangeFromSeed(bounds[0] + xOffset, bounds[1] - xOffset * 0.2, idx * 7.3 + slotInZone);
    const y = rangeFromSeed(bounds[2], bounds[3], idx * 11.7 + slotInZone * 3);

    const rotation = imperfectRotation(zone, idx);
    const scale    = imperfectScale(obj.emotionalWeight, idx);
    const depth    = ZONE_DEPTH[zone];

    // Memory Imperfection: distant objects (low depth) blur more
    const depthBlurFactor = depth === 0 ? 0.8 : depth === 1 ? 0.4 : 0;
    const blurAmount   = depthBlurFactor * imperfectionLevel;
    const shadowOpacity = 0.28 + obj.emotionalWeight * 0.42;

    placed.push({
      type: obj.type,
      label: obj.label,
      zone,
      positionX: Math.round(Math.max(2, Math.min(97, x))),
      positionY: Math.round(Math.max(2, Math.min(95, y))),
      rotation:  Math.round(rotation * 10) / 10,
      scale:     Math.round(scale * 100) / 100,
      depth,
      emotionalWeight: obj.emotionalWeight,
      metadata: {
        zone,
        emotionalWeight: obj.emotionalWeight,
        depth,
        narrativeRole: obj.narrativeRole,
        label: obj.label,
        imperfection: {
          blurAmount:     Math.round(blurAmount * 100) / 100,
          shadowOpacity:  Math.round(shadowOpacity * 100) / 100,
        },
      },
    });
  });

  // Sort by depth so the frontend renders background-first
  return placed.sort((a, b) => a.depth - b.depth);
}
