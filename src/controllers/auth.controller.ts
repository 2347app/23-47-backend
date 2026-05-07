import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../services/jwt";
import { HttpError } from "../middleware/error";
import { AuthedRequest } from "../middleware/auth";

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_\.]+$/, "Solo letras, números, guion bajo y punto"),
  displayName: z.string().min(1).max(40),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  identifier: z.string().min(1), // email o username
  password: z.string().min(1),
});

function buildTokens(userId: string, username: string) {
  const accessToken = signAccessToken({ sub: userId, username });
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: userId, jti });
  return { accessToken, refreshToken, jti };
}

export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });
  if (exists) throw new HttpError(409, "user_already_exists");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      passwordHash,
      status: { create: { status: "online" } },
      digitalRoom: { create: { theme: "madrugada-2003" } },
    },
    include: { status: true, digitalRoom: true },
  });

  const { accessToken, refreshToken, jti } = buildTokens(user.id, user.username);
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  res.status(201).json({
    user: sanitize(user),
    accessToken,
    refreshToken,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: data.identifier }, { username: data.identifier }] },
    include: { status: true, digitalRoom: true },
  });
  if (!user) throw new HttpError(401, "invalid_credentials");

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new HttpError(401, "invalid_credentials");

  const { accessToken, refreshToken, jti } = buildTokens(user.id, user.username);
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  res.json({
    user: sanitize(user),
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const schema = z.object({ refreshToken: z.string().min(10) });
  const { refreshToken } = schema.parse(req.body);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "invalid_refresh_token");
  }
  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!stored || stored.revokedAt || stored.token !== refreshToken) {
    throw new HttpError(401, "refresh_token_revoked");
  }
  if (stored.expiresAt.getTime() < Date.now()) throw new HttpError(401, "refresh_token_expired");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new HttpError(401, "invalid_refresh_token");

  // rotación
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });
  const { accessToken, refreshToken: newRefresh, jti } = buildTokens(user.id, user.username);
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      token: newRefresh,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  res.json({ accessToken, refreshToken: newRefresh });
}

export async function logout(req: AuthedRequest, res: Response): Promise<void> {
  const schema = z.object({ refreshToken: z.string().optional() });
  const { refreshToken } = schema.parse(req.body ?? {});
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.jti, userId: req.user?.id },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* ignore */
    }
  }
  res.json({ ok: true });
}

export async function me(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { status: true, digitalRoom: true },
  });
  if (!user) throw new HttpError(404, "user_not_found");
  res.json({ user: sanitize(user) });
}

function sanitize(user: any) {
  const { passwordHash, spotifyAccessToken, spotifyRefreshToken, ...rest } = user;
  return {
    ...rest,
    spotifyConnected: Boolean(spotifyAccessToken),
  };
}
