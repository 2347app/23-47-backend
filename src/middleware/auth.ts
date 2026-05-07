import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/jwt";

export interface AuthedRequest extends Request {
  user?: { id: string; username: string };
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : (req.cookies?.accessToken as string | undefined);
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : (req.cookies?.accessToken as string | undefined);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, username: payload.username };
    } catch {
      /* ignore */
    }
  }
  next();
}
