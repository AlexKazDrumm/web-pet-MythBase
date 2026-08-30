import LocationTree from "./LocationTree";
import type { CreatureType, MythLocation } from "../lib/types";

interface FiltersProps {
  types: CreatureType[];
  locations: MythLocation[];
  selectedTypes: string[];
  onToggleType: (name: string) => void;
  selectedLocations: number[];
  onToggleLocation: (id: number) => void;
  uniqueOnly: boolean;
  onToggleUnique: () => void;
}

export default function Filters({
  types,
  locations,
  selectedTypes,
  onToggleType,
  selectedLocations,
  onToggleLocation,
  uniqueOnly,
  onToggleUnique,
}: FiltersProps) {
  return (
    <>
      <div className="sidebar__section">
        <div className="sidebar__title">Типы</div>
        {types.length === 0 ? (
          <p className="detail__meta">Типов пока нет.</p>
        ) : (
          types.map((type) => (
            <label key={type.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.name)}
                onChange={() => onToggleType(type.name)}
              />
              <span>
                {type.name}
                {type.creatureCount !== undefined ? ` (${type.creatureCount})` : ""}
              </span>
            </label>
          ))
        )}
      </div>

      <div className="sidebar__section">
        <div className="sidebar__title">Локации</div>
        <LocationTree
          locations={locations}
          selectedIds={selectedLocations}
          onToggle={onToggleLocation}
          showCounts
        />
      </div>

      <div className="sidebar__section">
        <div className="sidebar__title">Дополнительно</div>
        <label className="checkbox-row">
          <input type="checkbox" checked={uniqueOnly} onChange={onToggleUnique} />
          <span>Только уникальные для выбранных локаций</span>
        </label>
      </div>
    </>
  );
}
