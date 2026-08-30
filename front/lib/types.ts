export interface CreatureType {
  id: number;
  name: string;
  creatureCount?: number;
}

export interface MythLocation {
  id: number;
  name: string;
  parentId: number | null;
  creatureCount?: number;
}

export interface Creature {
  id: number;
  name: string;
  description: string;
  coverLink: string;
  type: { id: number; name: string };
}

export interface CreatureDetail extends Creature {
  locations: { id: number; name: string }[];
  altNames: string[];
  nativeNames: string[];
}

export interface CreatureQuery {
  name?: string;
  type?: string;
  unique?: boolean;
  locations?: number[];
}

export interface NewCreature {
  name: string;
  description: string;
  coverLink: string;
  typeId: number;
  locationIds: number[];
}

export interface NewLocation {
  name: string;
  parentId: number | null;
}
