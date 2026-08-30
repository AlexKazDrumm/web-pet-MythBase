import { describe, expect, it } from "vitest";
import {
  buildChildrenMap,
  collectDescendantIds,
  collectSubtreeIds,
  groupLocationsByCreature,
  isCreatureInLocationSet,
  isCreatureUniqueToSet,
  type TreeNode,
} from "./locationTree";

const tree: TreeNode[] = [
  { id: 1, parentId: null }, // Aethergard
  { id: 2, parentId: 1 }, //   Sunmarch
  { id: 3, parentId: 1 }, //   Hollow Fens
  { id: 4, parentId: 3 }, //     Deep Fen
  { id: 5, parentId: null }, // Vaultlands
  { id: 6, parentId: 5 }, //   Iron Reach
];

describe("buildChildrenMap", () => {
  it("groups children under their parent id and roots under null", () => {
    const map = buildChildrenMap(tree);
    expect(map.get(null)).toEqual([1, 5]);
    expect(map.get(1)).toEqual([2, 3]);
    expect(map.get(3)).toEqual([4]);
    expect(map.has(6)).toBe(false);
  });
});

describe("collectDescendantIds", () => {
  it("includes the root and every descendant", () => {
    expect([...collectDescendantIds(tree, 1)].sort()).toEqual([1, 2, 3, 4]);
    expect([...collectDescendantIds(tree, 3)].sort()).toEqual([3, 4]);
    expect([...collectDescendantIds(tree, 6)].sort()).toEqual([6]);
  });

  it("is safe against cycles", () => {
    const cyclic: TreeNode[] = [
      { id: 1, parentId: 2 },
      { id: 2, parentId: 1 },
    ];
    expect([...collectDescendantIds(cyclic, 1)].sort()).toEqual([1, 2]);
  });

  it("returns just the root when it is unknown", () => {
    expect([...collectDescendantIds(tree, 99)]).toEqual([99]);
  });
});

describe("collectSubtreeIds", () => {
  it("unions the subtrees of every requested root", () => {
    expect([...collectSubtreeIds(tree, [3, 6])].sort()).toEqual([3, 4, 6]);
  });
});

describe("isCreatureInLocationSet", () => {
  it("is true when any creature location is allowed", () => {
    expect(isCreatureInLocationSet([2, 7], new Set([7]))).toBe(true);
    expect(isCreatureInLocationSet([2, 7], new Set([9]))).toBe(false);
    expect(isCreatureInLocationSet([], new Set([1]))).toBe(false);
  });
});

describe("isCreatureUniqueToSet", () => {
  it("with no constraint requires exactly one location", () => {
    expect(isCreatureUniqueToSet([4], null)).toBe(true);
    expect(isCreatureUniqueToSet([4, 5], null)).toBe(false);
    expect(isCreatureUniqueToSet([], null)).toBe(false);
    expect(isCreatureUniqueToSet([4], new Set())).toBe(true);
  });

  it("with a constraint requires every location to fall inside it", () => {
    const allowed = new Set([3, 4]);
    expect(isCreatureUniqueToSet([3, 4], allowed)).toBe(true);
    expect(isCreatureUniqueToSet([3, 4, 6], allowed)).toBe(false);
    expect(isCreatureUniqueToSet([], allowed)).toBe(false);
  });
});

describe("groupLocationsByCreature", () => {
  it("collects location ids per creature", () => {
    const map = groupLocationsByCreature([
      { creatureId: 1, locationId: 2 },
      { creatureId: 1, locationId: 3 },
      { creatureId: 2, locationId: 6 },
    ]);
    expect(map.get(1)).toEqual([2, 3]);
    expect(map.get(2)).toEqual([6]);
  });
});
