import { Router } from "express";
import { AppDataSource } from "../db/data-source";
import { CreatureLocation } from "../entities/CreatureLocation";
import { Location } from "../entities/Location";
import {
  collectDescendantIds,
  groupLocationsByCreature,
  isCreatureInLocationSet,
  isCreatureUniqueToSet,
  type TreeNode,
} from "../domain/locationTree";
import { asyncHandler } from "../http/asyncHandler";
import { badRequest } from "../http/errors";
import { writeRateLimiter } from "../http/rateLimit";
import { toLocationDto } from "../http/serializers";
import {
  createLocationSchema,
  listLocationsQuerySchema,
} from "../validation/schemas";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listLocationsQuerySchema.parse(req.query);

    const locations = await AppDataSource.getRepository(Location).find({
      order: { name: "ASC" },
    });

    const links = await AppDataSource.getRepository(CreatureLocation).find({
      relations: { creature: true },
    });

    const relevant = links.filter(
      (link) => !query.type || link.creature.type.name === query.type,
    );
    const locationsByCreature = groupLocationsByCreature(
      relevant.map((link) => ({
        creatureId: link.creatureId,
        locationId: link.locationId,
      })),
    );

    const tree: TreeNode[] = locations.map((loc) => ({
      id: loc.id,
      parentId: loc.parentId ?? null,
    }));

    const payload = locations.map((loc) => {
      const subtree = collectDescendantIds(tree, loc.id);
      let count = 0;
      for (const locs of locationsByCreature.values()) {
        if (!isCreatureInLocationSet(locs, subtree)) continue;
        if (query.unique && !isCreatureUniqueToSet(locs, subtree)) continue;
        count += 1;
      }
      return toLocationDto(loc, count);
    });

    res.json(payload);
  }),
);

router.post(
  "/",
  writeRateLimiter,
  asyncHandler(async (req, res) => {
    const input = createLocationSchema.parse(req.body);
    const repo = AppDataSource.getRepository(Location);

    if (input.parentId !== null) {
      const parent = await repo.findOneBy({ id: input.parentId });
      if (!parent) throw badRequest("Unknown parent location");
    }

    const saved = await repo.save(
      repo.create({
        name: input.name,
        parent: input.parentId === null ? null : ({ id: input.parentId } as Location),
      }),
    );

    const location = await repo.findOneByOrFail({ id: saved.id });
    res.status(201).json(toLocationDto(location));
  }),
);

export default router;
