import axios from "axios";
import { env } from "../config/env";
import { prisma } from "../services/prisma";

const SPOTIFY_AUTH = "https://accounts.spotify.com";
const SPOTIFY_API = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.spotifyClientId,
    response_type: "code",
    redirect_uri: env.spotifyRedirectUri,
    state,
    scope: SPOTIFY_SCOPES.join(" "),
  });
  return `${SPOTIFY_AUTH}/authorize?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const basic = Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString("base64");
  const { data } = await axios.post<TokenResponse>(
    `${SPOTIFY_AUTH}/api/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.spotifyRedirectUri,
    }),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const basic = Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString("base64");
  const { data } = await axios.post<TokenResponse>(
    `${SPOTIFY_AUTH}/api/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.spotifyAccessToken || !user.spotifyRefreshToken) return null;
  const margin = 30 * 1000;
  if (user.spotifyTokenExpires && user.spotifyTokenExpires.getTime() - margin > Date.now()) {
    return user.spotifyAccessToken;
  }
  try {
    const refreshed = await refreshAccessToken(user.spotifyRefreshToken);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: refreshed.access_token,
        spotifyTokenExpires: new Date(Date.now() + refreshed.expires_in * 1000),
        ...(refreshed.refresh_token ? { spotifyRefreshToken: refreshed.refresh_token } : {}),
      },
    });
    return updated.spotifyAccessToken;
  } catch (err) {
    console.error("[spotify] refresh error", err);
    return null;
  }
}

export async function spotifyApi<T>(userId: string, path: string, params?: Record<string, string>): Promise<T | null> {
  const token = await getValidAccessToken(userId);
  if (!token) return null;
  try {
    const { data } = await axios.get<T>(`${SPOTIFY_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return data;
  } catch (err: any) {
    if (err?.response?.status === 204) return null; // no content (no playing)
    console.error("[spotify] api error", path, err?.response?.status);
    return null;
  }
}

export async function fetchProfile(userId: string) {
  return spotifyApi<{ id: string; display_name: string; email: string; images: Array<{ url: string }> }>(
    userId,
    "/me"
  );
}

export interface SpotifyCurrentTrack {
  isPlaying: boolean;
  track?: {
    id: string;
    name: string;
    artists: string[];
    album: string;
    cover?: string;
    url?: string;
    progressMs?: number;
    durationMs?: number;
  };
}

export async function fetchCurrentTrack(userId: string): Promise<SpotifyCurrentTrack> {
  const token = await getValidAccessToken(userId);
  if (!token) return { isPlaying: false };
  try {
    const { data, status } = await axios.get<any>(`${SPOTIFY_API}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (status === 204 || !data?.item) return { isPlaying: false };
    return {
      isPlaying: Boolean(data.is_playing),
      track: {
        id: data.item.id,
        name: data.item.name,
        artists: data.item.artists?.map((a: any) => a.name) ?? [],
        album: data.item.album?.name,
        cover: data.item.album?.images?.[0]?.url,
        url: data.item.external_urls?.spotify,
        progressMs: data.progress_ms,
        durationMs: data.item.duration_ms,
      },
    };
  } catch (err: any) {
    if (err?.response?.status === 204) return { isPlaying: false };
    console.error("[spotify] currently-playing error", err?.response?.status);
    return { isPlaying: false };
  }
}

export async function fetchPlaylists(userId: string) {
  return spotifyApi<{ items: any[] }>(userId, "/me/playlists", { limit: "30" });
}

export async function fetchRecommendations(userId: string, seedGenres: string[]) {
  return spotifyApi<{ tracks: any[] }>(userId, "/recommendations", {
    seed_genres: seedGenres.slice(0, 5).join(","),
    limit: "20",
  });
}
