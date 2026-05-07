import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { ERAS, findEra } from "../config/eras";
import { prisma } from "../services/prisma";

export async function listEras(_req: AuthedRequest, res: Response): Promise<void> {
  res.json({ eras: ERAS });
}

export async function getEra(req: AuthedRequest, res: Response): Promise<void> {
  const era = findEra(req.params.id);
  if (!era) throw new HttpError(404, "era_not_found");
  res.json({ era });
}

export async function travel(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "unauthorized");
  const schema = z.object({ era: z.string(), mood: z.string().optional() });
  const data = schema.parse(req.body);
  const era = findEra(data.era);
  if (!era) throw new HttpError(404, "era_not_found");

  await prisma.nostalgiaSession.create({
    data: { userId: req.user.id, era: era.id, mood: data.mood ?? null },
  });
  await prisma.user.update({ where: { id: req.user.id }, data: { theme: era.id } });
  res.json({ ok: true, era });
}
