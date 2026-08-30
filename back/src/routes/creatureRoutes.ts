import { Router } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../db/data-source";
import { Creature } from "../entities/Creature";
import { CreatureLocation } from "../entities/CreatureLocation";
import { Location } from "../entities/Location";
import { TypeEntity } from "../entities/TypeEntity";
import {
  collectSubtreeIds,
  groupLocationsByCreature,
  isCreatureInLocationSet,
  isCreatureUniqueToSet,
  type TreeNode,
} from "../domain/locationTree";
import { asyncHandler } from "../http/asyncHandler";
import { badRequest, notFound } from "../http/errors";
import { writeRateLimiter } from "../http/rateLimit";
import {
  toCreatureDetailDto,
  toCreatureDto,
} from "../http/serializers";
import {
  createCreatureSchema,
  idParamSchema,
  listCreaturesQuerySchema,
} from "../validation/schemas";

const router = Router();

async function loadLocationTree(): Promise<TreeNode[]> {
  const rows = await AppDataSource.getRepository(Location).find();
  // parentId is a @RelationId column, populated on every load.
  return rows.map((row) => ({ id: row.id, parentId: row.parentId ?? null }));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listCreaturesQuerySchema.parse(req.query);

    const qb = AppDataSource.getRepository(Creature)
      .createQueryBuilder("creature")
      .leftJoinAndSelect("creature.type", "type")
      .orderBy("creature.name", "ASC");

    if (query.name) {
      qb.andWhere("creature.name ILIKE :name", { name: `%${query.name}%` });
    }
    if (query.type) {
      qb.andWhere("type.name = :type", { type: query.type });
    }

    const creatures = await qb.getMany();
    const hasLocationFilter = query.locations.length > 0;

    if (!hasLocationFilter && !query.unique) {
      res.json(creatures.map(toCreatureDto));
      return;
    }

    const links = await AppDataSource.getRepository(CreatureLocation).find({
      where: { creature: { id: In(creatures.map((c) => c.id)) } },
    });
    const locationsByCreature = groupLocationsByCreature(
      links.map((link) => ({
        creatureId: link.creatureId,
        locationId: link.locationId,
      })),
    );

    let allowed: Set<number> | null = null;
    if (hasLocationFilter) {
      const tree = await loadLocationTree();
      allowed = collectSubtreeIds(tree, query.locations);
    }

    const filtered = creatures.filter((creature) => {
      const locs = locationsByCreature.get(creature.id) ?? [];
      if (allowed && !isCreatureInLocationSet(locs, allowed)) return false;
      if (query.unique && !isCreatureUniqueToSet(locs, allowed)) return false;
      return true;
    });

    res.json(filtered.map(toCreatureDto));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const creature = await AppDataSource.getRepository(Creature).findOne({
      where: { id },
      relations: { altNames: true, nativeNames: true },
    });
    if (!creature) throw notFound("Creature not found");

    const links = await AppDataSource.getRepository(CreatureLocation).find({
      where: { creature: { id } },
      relations: { location: true },
    });
    const locations = links
      .map((link) => ({ id: link.location.id, name: link.location.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(toCreatureDetailDto(creature, locations));
  }),
);

router.post(
  "/",
  writeRateLimiter,
  asyncHandler(async (req, res) => {
    const input = createCreatureSchema.parse(req.body);
    const locationIds = [...new Set(input.locationIds)];

    const created = await AppDataSource.transaction(async (manager) => {
      const type = await manager.getRepository(TypeEntity).findOneBy({
        id: input.typeId,
      });
      if (!type) throw notFound("Type not found");

      const foundLocations = await manager
        .getRepository(Location)
        .findBy({ id: In(locationIds) });
      if (foundLocations.length !== locationIds.length) {
        const known = new Set(foundLocations.map((l) => l.id));
        const missing = locationIds.filter((locId) => !known.has(locId));
        throw badRequest(`Unknown location ids: ${missing.join(", ")}`);
      }

      const creatureRepo = manager.getRepository(Creature);
      const creature = await creatureRepo.save(
        creatureRepo.create({
          name: input.name,
          description: input.description,
          coverLink: input.coverLink,
          type,
        }),
      );

      const linkRepo = manager.getRepository(CreatureLocation);
      await linkRepo.save(
        foundLocations.map((location) =>
          linkRepo.create({ creature, location }),
        ),
      );

      return { creature, locations: foundLocations };
    });

    res
      .status(201)
      .json(
        toCreatureDetailDto(
          created.creature,
          created.locations
            .map((l) => ({ id: l.id, name: l.name }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      );
  }),
);

export default router;
