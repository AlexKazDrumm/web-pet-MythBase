import { useState } from "react";
import Modal from "./Modal";
import LocationTree from "./LocationTree";
import { ApiError, api } from "../lib/api";
import type { CreatureDetail, CreatureType, MythLocation } from "../lib/types";

interface CreateCreatureModalProps {
  types: CreatureType[];
  locations: MythLocation[];
  onClose: () => void;
  onCreated: (creature: CreatureDetail) => void;
}

export default function CreateCreatureModal({
  types,
  locations,
  onClose,
  onCreated,
}: CreateCreatureModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverLink, setCoverLink] = useState("");
  const [typeId, setTypeId] = useState(0);
  const [locationIds, setLocationIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLocation = (id: number) => {
    setLocationIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const canSubmit =
    name.trim() &&
    description.trim() &&
    coverLink.trim() &&
    typeId > 0 &&
    locationIds.length > 0 &&
    !submitting;

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError("Заполните все поля и выберите хотя бы одну локацию.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createCreature({
        name: name.trim(),
        description: description.trim(),
        coverLink: coverLink.trim(),
        typeId,
        locationIds,
      });
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось создать существо.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Новое существо" onClose={onClose} wide>
      <label className="field">
        <span className="field__label">Название</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={128}
        />
      </label>

      <label className="field">
        <span className="field__label">Описание</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={4000}
        />
      </label>

      <label className="field">
        <span className="field__label">Файл обложки (например, glimmerwyrm.svg)</span>
        <input
          type="text"
          value={coverLink}
          onChange={(event) => setCoverLink(event.target.value)}
          maxLength={256}
        />
      </label>

      <label className="field">
        <span className="field__label">Тип</span>
        <select
          value={typeId}
          onChange={(event) => setTypeId(Number(event.target.value))}
        >
          <option value={0}>— выберите тип —</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span className="field__label">Локации</span>
        <LocationTree
          locations={locations}
          selectedIds={locationIds}
          onToggle={toggleLocation}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="btn-row" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={submit}
          disabled={!canSubmit}
        >
          {submitting ? "Сохранение…" : "Сохранить"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  );
}
