import "reflect-metadata";
import type { EntityManager } from "typeorm";
import { AppDataSource } from "./data-source";
import {
  seedCreatures,
  seedLocations,
  seedTypes,
  type SeedLocation,
} from "./seed-data";
import { AltCreatureName } from "../entities/AltCreatureName";
import { Creature } from "../entities/Creature";
import { CreatureLocation } from "../entities/CreatureLocation";
import { Location } from "../entities/Location";
import { NativeCreatureName } from "../entities/NativeCreatureName";
import { TypeEntity } from "../entities/TypeEntity";

export interface SeedOptions {
  replaceExisting?: boolean;
}

async function insertLocations(
  manager: EntityManager,
  nodes: SeedLocation[],
  parent: Location | null,
  registry: Map<string, Location>,
): Promise<void> {
  const repo = manager.getRepository(Location);
  for (const node of nodes) {
    const location = await repo.save(repo.create({ name: node.name, parent }));
    registry.set(node.name, location);
    if (node.children?.length) {
      await insertLocations(manager, node.children, location, registry);
    }
  }
}

export async function seed(
  manager: EntityManager,
  options: SeedOptions = {},
): Promise<void> {
  const typeCount = await manager.getRepository(TypeEntity).count();
  const locationCount = await manager.getRepository(Location).count();
  const creatureCount = await manager.getRepository(Creature).count();
  const hasData = typeCount + locationCount + creatureCount > 0;

  if (hasData && !options.replaceExisting) {
    throw new Error(
      "Database already contains MythBase data. Set SEED_FORCE=true to replace it.",
    );
  }

  if (hasData) {
    await manager.query(
      `TRUNCATE TABLE
         "creature_locations",
         "alt_creature_names",
         "native_creature_names",
         "creatures",
         "locations",
         "types"
       RESTART IDENTITY CASCADE`,
    );
  }

  const typeRepo = manager.getRepository(TypeEntity);
  const typeByName = new Map<string, TypeEntity>();
  for (const name of seedTypes) {
    typeByName.set(name, await typeRepo.save(typeRepo.create({ name })));
  }

  const locationByName = new Map<string, Location>();
  await insertLocations(manager, seedLocations, null, locationByName);

  const creatureRepo = manager.getRepository(Creature);
  const linkRepo = manager.getRepository(CreatureLocation);
  const altRepo = manager.getRepository(AltCreatureName);
  const nativeRepo = manager.getRepository(NativeCreatureName);

  for (const entry of seedCreatures) {
    const type = typeByName.get(entry.type);
    if (!type) throw new Error(`Seed type not found: ${entry.type}`);

    const creature = await creatureRepo.save(
      creatureRepo.create({
        name: entry.name,
        description: entry.description,
        coverLink: entry.coverLink,
        type,
      }),
    );

    for (const locationName of entry.locations) {
      const location = locationByName.get(locationName);
      if (!location) throw new Error(`Seed location not found: ${locationName}`);
      await linkRepo.save(linkRepo.create({ creature, location }));
    }

    for (const name of entry.altNames ?? []) {
      await altRepo.save(altRepo.create({ creature, name }));
    }
    for (const name of entry.nativeNames ?? []) {
      await nativeRepo.save(nativeRepo.create({ creature, name }));
    }
  }
}

async function run(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const replaceExisting = ["1", "true", "yes"].includes(
      (process.env.SEED_FORCE ?? "").toLowerCase(),
    );
    await AppDataSource.transaction((manager) =>
      seed(manager, { replaceExisting }),
    );
    const [types, locations, creatures] = await Promise.all([
      AppDataSource.getRepository(TypeEntity).count(),
      AppDataSource.getRepository(Location).count(),
      AppDataSource.getRepository(Creature).count(),
    ]);
    console.log(
      `Seed complete: ${types} types, ${locations} locations, ${creatures} creatures.`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
}
