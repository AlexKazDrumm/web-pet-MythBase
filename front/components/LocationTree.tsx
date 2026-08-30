import { useMemo, useState } from "react";
import type { MythLocation } from "../lib/types";

interface LocationTreeProps {
  locations: MythLocation[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  showCounts?: boolean;
}

export default function LocationTree({
  locations,
  selectedIds,
  onToggle,
  showCounts = false,
}: LocationTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const childrenByParent = useMemo(() => {
    const map = new Map<number | null, MythLocation[]>();
    for (const location of locations) {
      const key = location.parentId ?? null;
      const bucket = map.get(key);
      if (bucket) bucket.push(location);
      else map.set(key, [location]);
    }
    return map;
  }, [locations]);

  const selected = new Set(selectedIds);

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderLevel = (parentId: number | null, depth: number) => {
    const children = childrenByParent.get(parentId) ?? [];
    if (children.length === 0) return null;

    return children.map((location) => {
      const hasChildren = (childrenByParent.get(location.id) ?? []).length > 0;
      const isCollapsed = collapsed.has(location.id);

      return (
        <div key={location.id} style={{ marginLeft: depth * 14 }}>
          <div className="tree__row">
            {hasChildren ? (
              <span
                className="tree__toggle"
                role="button"
                tabIndex={0}
                onClick={() => toggleCollapse(location.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleCollapse(location.id);
                  }
                }}
              >
                {isCollapsed ? "▸" : "▾"}
              </span>
            ) : (
              <span className="tree__toggle" aria-hidden="true">
                ·
              </span>
            )}
            <label className="checkbox-row" style={{ padding: 0 }}>
              <input
                type="checkbox"
                checked={selected.has(location.id)}
                onChange={() => onToggle(location.id)}
              />
              <span>
                {location.name}
                {showCounts && location.creatureCount !== undefined
                  ? ` (${location.creatureCount})`
                  : ""}
              </span>
            </label>
          </div>
          {!isCollapsed && renderLevel(location.id, depth + 1)}
        </div>
      );
    });
  };

  if (locations.length === 0) {
    return <p className="detail__meta">Локаций пока нет.</p>;
  }

  return <div className="tree">{renderLevel(null, 0)}</div>;
}
