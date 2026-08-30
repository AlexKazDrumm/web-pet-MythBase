export interface TreeNode {
  id: number;
  parentId: number | null;
}

export function buildChildrenMap(
  nodes: readonly TreeNode[],
): Map<number | null, number[]> {
  const map = new Map<number | null, number[]>();
  for (const node of nodes) {
    const key = node.parentId ?? null;
    const bucket = map.get(key);
    if (bucket) bucket.push(node.id);
    else map.set(key, [node.id]);
  }
  return map;
}

export function collectDescendantIds(
  nodes: readonly TreeNode[],
  rootId: number,
): Set<number> {
  const childrenMap = buildChildrenMap(nodes);
  const result = new Set<number>();
  const stack: number[] = [rootId];
  while (stack.length > 0) {
    const current = stack.pop() as number;
    if (result.has(current)) continue;
    result.add(current);
    for (const child of childrenMap.get(current) ?? []) {
      if (!result.has(child)) stack.push(child);
    }
  }
  return result;
}

export function collectSubtreeIds(
  nodes: readonly TreeNode[],
  rootIds: readonly number[],
): Set<number> {
  const result = new Set<number>();
  for (const rootId of rootIds) {
    for (const id of collectDescendantIds(nodes, rootId)) result.add(id);
  }
  return result;
}

export function isCreatureInLocationSet(
  creatureLocationIds: readonly number[],
  allowed: ReadonlySet<number>,
): boolean {
  return creatureLocationIds.some((id) => allowed.has(id));
}

// С выбранными локациями учитывается всё поддерево, но не локации за его пределами.
export function isCreatureUniqueToSet(
  creatureLocationIds: readonly number[],
  allowed: ReadonlySet<number> | null,
): boolean {
  if (!allowed || allowed.size === 0) {
    return creatureLocationIds.length === 1;
  }
  return (
    creatureLocationIds.length > 0 &&
    creatureLocationIds.every((id) => allowed.has(id))
  );
}

export function groupLocationsByCreature(
  links: readonly { creatureId: number; locationId: number }[],
): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (const link of links) {
    const bucket = map.get(link.creatureId);
    if (bucket) bucket.push(link.locationId);
    else map.set(link.creatureId, [link.locationId]);
  }
  return map;
}
