import "reflect-metadata";
import type { Server } from "node:http";
import { env } from "./config/env";
import { AppDataSource } from "./db/data-source";
import { createApp } from "./http/app";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();

  if (env.RUN_MIGRATIONS) {
    const applied = await AppDataSource.runMigrations();
    console.log(`Applied ${applied.length} migration(s).`);
  }

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`MythBase API listening on port ${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`Received ${signal}, shutting down.`);
    server.close(() => {
      void AppDataSource.destroy().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
