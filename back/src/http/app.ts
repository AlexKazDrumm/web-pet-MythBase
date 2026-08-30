import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "../config/env";
import creatureRoutes from "../routes/creatureRoutes";
import locationRoutes from "../routes/locationRoutes";
import typeRoutes from "../routes/typeRoutes";
import { errorHandler, notFoundHandler } from "./errorHandler";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST"],
    }),
  );
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/creatures", creatureRoutes);
  app.use("/locations", locationRoutes);
  app.use("/types", typeRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
