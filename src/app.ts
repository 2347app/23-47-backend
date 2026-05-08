import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";

// ── Multi-origin CORS ────────────────────────────────────────────────────────
// FRONTEND_URL can be comma-separated: "https://23-47.app,http://localhost:5173"
const allowedOrigins = env.frontendUrl
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some((o) => o === origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

// ── Lightweight in-memory rate limiter (no extra package) ───────────────────
const authHits = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX = 20;

function authRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? req.ip ?? "unknown";
  const now = Date.now();
  const entry = authHits.get(ip);
  if (!entry || now > entry.resetAt) {
    authHits.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return next();
  }
  entry.count++;
  if (entry.count > AUTH_MAX) {
    res.status(429).json({ error: "too_many_requests" });
    return;
  }
  next();
}

// Prevent map from growing unbounded — prune on each request
setInterval(() => {
  const now = Date.now();
  authHits.forEach((v, k) => { if (now > v.resetAt) authHits.delete(k); });
}, 5 * 60_000).unref();

// ── App factory ──────────────────────────────────────────────────────────────
export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (env.nodeEnv !== "production") app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "2347-backend", env: env.nodeEnv });
  });

  app.use("/api/auth", authRateLimit);
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
