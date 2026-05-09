// =====================================================
// Phase 2 — Identity Reconstruction Engine
// Maps cultural markers to emotional archetypes.
// Infers WHO the person was, not what they owned.
// =====================================================

import type { SemanticProfile, IdentityProfile } from "./types";

const ARCHETYPE_MAP: Record<string, string[]> = {
  ps2:                 ["console_gamer", "living_room_teenager"],
  ps1:                 ["early_gamer", "90s_born_2000s_teen"],
  msn_messenger:       ["digital_social", "night_chatter", "emoticon_poet"],
  linkin_park:         ["emotional_teenager", "hybrid_theory_kid"],
  avril_lavigne:       ["pop_punk_fan", "mainstream_rebel"],
  my_chemical_romance: ["emo_teenager", "emotional_refuge_seeker"],
  pes:                 ["sports_gamer", "weekend_ritualist"],
  winamp:              ["music_obsessed", "playlist_curator"],
  myspace:             ["social_networker", "self_expresser"],
  pc_gaming:           ["pc_master_race_early", "tech_curious"],
  mp3_player:          ["music_collector", "commuter_daydreamer"],
  cd_collection:       ["physical_media_devotee", "music_ritualist"],
  counter_strike:      ["competitive_gamer", "lan_party_regular"],
  habbo_hotel:         ["virtual_world_explorer", "digital_socialite"],
  tuenti:              ["spanish_digital_native", "social_connector"],
  forum_user:          ["niche_community_member", "knowledge_seeker"],
  p2p_music:           ["piracy_nostalgic", "music_freedom_seeker"],
};

const NOCTURNAL_MARKERS = [
  "msn_messenger", "pc_gaming", "counter_strike", "ps2", "forum_user",
];

const LIFESTYLE_BY_DENSITY: Record<string, string> = {
  high:   "intensely emotional, long nights, the room was a sanctuary",
  medium: "balanced between online and offline, typical teenager of the era",
  low:    "casual digital user, more grounded in the physical world",
};

export function reconstructIdentity(profile: SemanticProfile): IdentityProfile {
  const archetypes = new Set<string>();

  for (const marker of profile.culturalMarkers) {
    (ARCHETYPE_MAP[marker] ?? []).forEach((a) => archetypes.add(a));
  }

  // Infer from personality string tokens
  const p = profile.personality.toLowerCase();
  if (p.includes("gamer"))      archetypes.add("dedicated_gamer");
  if (p.includes("night"))      archetypes.add("night_owl");
  if (p.includes("introvert"))  archetypes.add("solitary_teenager");
  if (p.includes("creative"))   archetypes.add("bedroom_creator");
  if (profile.roomEnergy.includes("refuge"))  archetypes.add("bedroom_world_builder");
  if (profile.roomEnergy.includes("chaos"))   archetypes.add("organized_chaos_dweller");

  const isNocturnal =
    profile.timePattern === "night" ||
    profile.timePattern === "late_night" ||
    p.includes("night") ||
    profile.culturalMarkers.some((m) => NOCTURNAL_MARKERS.includes(m));

  const socialPattern =
    profile.personality.includes("introvert") || profile.socialIdentity.includes("solo")
      ? "isolated"
      : profile.socialIdentity.includes("social") || profile.culturalMarkers.includes("msn_messenger")
      ? "connected"
      : "mixed";

  const decade =
    ["2000", "2001", "2002", "2003"].some((y) => profile.era.includes(y))
      ? "early_2000s"
      : ["2007", "2008", "2009"].some((y) => profile.era.includes(y))
      ? "late_2000s"
      : "mid_2000s";

  return {
    archetypes: Array.from(archetypes).slice(0, 6),
    lifestyle: LIFESTYLE_BY_DENSITY[profile.emotionalDensity] ?? LIFESTYLE_BY_DENSITY.medium,
    isNocturnal,
    socialPattern,
    decade,
    emotionalTone: profile.roomEnergy,
    emotionalAnchor: profile.culturalMarkers[0] ?? "internet",
  };
}
