import { Router } from "express";
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
import { toTypeDto } from "../http/serializers";
import { listTypesQuerySchema } from "../validation/schemas";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listTypesQuerySchema.parse(req.query);

    const types = await AppDataSource.getRepository(TypeEntity).find({
      order: { name: "ASC" },
    });
    const creatures = await AppDataSource.getRepository(Creature).find({
      loadEagerRelations: false,
    });
    const links = await AppDataSource.getRepository(CreatureLocation).find();

    const creatureType = new Map<number, number>(
      creatures.map((c) => [c.id, c.typeId]),
    );
    const locationsByCreature = groupLocationsByCreature(
      links.map((link) => ({
        creatureId: link.creatureId,
        locationId: link.locationId,
      })),
    );

    let allowed: Set<number> | null = null;
    if (query.locations.length > 0) {
      const locations = await AppDataSource.getRepository(Location).find();
      const tree: TreeNode[] = locations.map((loc) => ({
        id: loc.id,
        parentId: loc.parentId ?? null,
      }));
      allowed = collectSubtreeIds(tree, query.locations);
    }

    const payload = types.map((type) => {
      let count = 0;
      for (const [creatureId, typeId] of creatureType) {
        if (typeId !== type.id) continue;
        const locs = locationsByCreature.get(creatureId) ?? [];
        if (allowed && !isCreatureInLocationSet(locs, allowed)) continue;
        if (query.unique && !isCreatureUniqueToSet(locs, allowed)) continue;
        count += 1;
      }
      return toTypeDto(type, count);
    });

    res.json(payload);
  }),
);

export default router;
