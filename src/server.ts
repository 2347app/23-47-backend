import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { createIo } from "./websocket/io";

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);
  createIo(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`\n🌙 23:47 backend listening on http://localhost:${env.port}`);
    console.log(`   env: ${env.nodeEnv}`);
    console.log(`   frontend: ${env.frontendUrl}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[${signal}] graceful shutdown…`);
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[bootstrap] fatal", err);
  process.exit(1);
});
