import type { Creature } from "../entities/Creature";
import type { Location } from "../entities/Location";
import type { TypeEntity } from "../entities/TypeEntity";

export interface TypeDto {
  id: number;
  name: string;
  creatureCount?: number;
}

export interface LocationDto {
  id: number;
  name: string;
  parentId: number | null;
  creatureCount?: number;
}

export interface CreatureDto {
  id: number;
  name: string;
  description: string;
  coverLink: string;
  type: { id: number; name: string };
}

export interface CreatureDetailDto extends CreatureDto {
  locations: { id: number; name: string }[];
  altNames: string[];
  nativeNames: string[];
}

export const toTypeDto = (type: TypeEntity, creatureCount?: number): TypeDto => ({
  id: type.id,
  name: type.name,
  ...(creatureCount === undefined ? {} : { creatureCount }),
});

export const toLocationDto = (
  location: Location,
  creatureCount?: number,
): LocationDto => ({
  id: location.id,
  name: location.name,
  parentId: location.parentId ?? null,
  ...(creatureCount === undefined ? {} : { creatureCount }),
});

export const toCreatureDto = (creature: Creature): CreatureDto => ({
  id: creature.id,
  name: creature.name,
  description: creature.description,
  coverLink: creature.coverLink,
  type: { id: creature.type.id, name: creature.type.name },
});

export const toCreatureDetailDto = (
  creature: Creature,
  locations: { id: number; name: string }[],
): CreatureDetailDto => ({
  ...toCreatureDto(creature),
  locations,
  altNames: (creature.altNames ?? []).map((entry) => entry.name),
  nativeNames: (creature.nativeNames ?? []).map((entry) => entry.name),
});
