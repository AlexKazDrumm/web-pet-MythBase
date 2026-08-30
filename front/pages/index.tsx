import { useCallback, useEffect, useRef, useState } from "react";
import CreateCreatureModal from "../components/CreateCreatureModal";
import CreateLocationModal from "../components/CreateLocationModal";
import CreatureDetailModal from "../components/CreatureDetailModal";
import CreatureGrid from "../components/CreatureGrid";
import Filters from "../components/Filters";
import { ApiError, api } from "../lib/api";
import type { Creature, CreatureType, MythLocation } from "../lib/types";

type Status = "loading" | "error" | "ready";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [uniqueOnly, setUniqueOnly] = useState(false);

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string>();

  const [types, setTypes] = useState<CreatureType[]>([]);
  const [locations, setLocations] = useState<MythLocation[]>([]);

  const [showCreateCreature, setShowCreateCreature] = useState(false);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const reloadToken = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const singleType = selectedTypes.length === 1 ? selectedTypes[0] : undefined;

  const loadFacets = useCallback(async () => {
    try {
      const [nextTypes, nextLocations] = await Promise.all([
        api.listTypes({ locations: selectedLocations, unique: uniqueOnly }),
        api.listLocations({ type: singleType, unique: uniqueOnly }),
      ]);
      setTypes(nextTypes);
      setLocations(nextLocations);
    } catch {
      /* facets are non-critical; the grid surfaces hard errors */
    }
  }, [selectedLocations, singleType, uniqueOnly]);

  const loadCreatures = useCallback(async () => {
    const token = ++reloadToken.current;
    setStatus("loading");
    setError(undefined);
    try {
      const result = await api.listCreatures({
        name: debouncedSearch || undefined,
        type: singleType,
        unique: uniqueOnly,
        locations: selectedLocations,
      });
      if (token !== reloadToken.current) return;
      const filtered =
        selectedTypes.length > 1
          ? result.filter((creature) => selectedTypes.includes(creature.type.name))
          : result;
      setCreatures(filtered);
      setStatus("ready");
    } catch (err) {
      if (token !== reloadToken.current) return;
      setError(
        err instanceof ApiError ? err.message : "Неизвестная ошибка запроса.",
      );
      setStatus("error");
    }
  }, [debouncedSearch, singleType, uniqueOnly, selectedLocations, selectedTypes]);

  useEffect(() => {
    void loadCreatures();
  }, [loadCreatures]);

  useEffect(() => {
    void loadFacets();
  }, [loadFacets]);

  const toggleType = (name: string) =>
    setSelectedTypes((prev) =>
      prev.includes(name) ? prev.filter((value) => value !== name) : [...prev, name],
    );

  const toggleLocation = (id: number) =>
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );

  const afterCreatureCreated = () => {
    setShowCreateCreature(false);
    void loadCreatures();
    void loadFacets();
  };

  const afterLocationCreated = () => {
    setShowCreateLocation(false);
    void loadFacets();
  };

  return (
    <div className="catalog">
      <aside className="panel sidebar">
        <div className="sidebar__section">
          <div className="sidebar__title">Поиск</div>
          <input
            type="search"
            placeholder="Имя существа…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Filters
          types={types}
          locations={locations}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          selectedLocations={selectedLocations}
          onToggleLocation={toggleLocation}
          uniqueOnly={uniqueOnly}
          onToggleUnique={() => setUniqueOnly((value) => !value)}
        />

        <div className="sidebar__section">
          <div className="btn-row">
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => setShowCreateCreature(true)}
            >
              Добавить существо
            </button>
            <button
              type="button"
              className="btn btn--block"
              onClick={() => setShowCreateLocation(true)}
            >
              Добавить локацию
            </button>
          </div>
        </div>
      </aside>

      <section>
        <div className="toolbar">
          <h1>Существа</h1>
          {status === "ready" && (
            <span className="toolbar__count">{creatures.length} в списке</span>
          )}
        </div>

        <CreatureGrid
          creatures={creatures}
          status={status}
          error={error}
          onRetry={() => void loadCreatures()}
          onSelect={(creature) => setDetailId(creature.id)}
        />
      </section>

      {showCreateCreature && (
        <CreateCreatureModal
          types={types}
          locations={locations}
          onClose={() => setShowCreateCreature(false)}
          onCreated={afterCreatureCreated}
        />
      )}
      {showCreateLocation && (
        <CreateLocationModal
          locations={locations}
          onClose={() => setShowCreateLocation(false)}
          onCreated={afterLocationCreated}
        />
      )}
      {detailId !== null && (
        <CreatureDetailModal
          creatureId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
