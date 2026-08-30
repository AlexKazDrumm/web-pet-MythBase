import { z } from "zod";

const boolFlag = z
  .enum(["0", "1", "true", "false"])
  .optional()
  .transform((value) => value === "1" || value === "true");

const toArray = (value: unknown): unknown[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

const idListQuery = z
  .preprocess(toArray, z.array(z.coerce.number().int().positive()))
  .transform((ids) => [...new Set(ids)]);

const trimmed = (max: number) => z.string().trim().min(1).max(max);

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listCreaturesQuerySchema = z.object({
  name: z.string().trim().max(128).optional(),
  type: z.string().trim().max(64).optional(),
  unique: boolFlag,
  locations: idListQuery,
});

export const createCreatureSchema = z
  .object({
    name: trimmed(128),
    description: trimmed(4000),
    coverLink: trimmed(256),
    typeId: z.number().int().positive(),
    locationIds: z.array(z.number().int().positive()).min(1).max(64),
  })
  .strict();

export const listLocationsQuerySchema = z.object({
  type: z.string().trim().max(64).optional(),
  unique: boolFlag,
});

export const createLocationSchema = z
  .object({
    name: trimmed(128),
    parentId: z.number().int().positive().nullable().optional().default(null),
  })
  .strict();

export const listTypesQuerySchema = z.object({
  unique: boolFlag,
  locations: idListQuery,
});

export type CreateCreatureInput = z.infer<typeof createCreatureSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
