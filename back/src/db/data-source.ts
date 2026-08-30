import "reflect-metadata";
import path from "node:path";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { AltCreatureName } from "../entities/AltCreatureName";
import { Creature } from "../entities/Creature";
import { CreatureLocation } from "../entities/CreatureLocation";
import { Location } from "../entities/Location";
import { NativeCreatureName } from "../entities/NativeCreatureName";
import { TypeEntity } from "../entities/TypeEntity";

const migrationsDir = path.join(__dirname, "..", "migrations", "*.{ts,js}");

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  entities: [
    Creature,
    TypeEntity,
    Location,
    AltCreatureName,
    NativeCreatureName,
    CreatureLocation,
  ],
  migrations: [migrationsDir],
});
