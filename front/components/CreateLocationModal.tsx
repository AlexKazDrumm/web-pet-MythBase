import { useState } from "react";
import Modal from "./Modal";
import { ApiError, api } from "../lib/api";
import type { MythLocation } from "../lib/types";

interface CreateLocationModalProps {
  locations: MythLocation[];
  onClose: () => void;
  onCreated: (location: MythLocation) => void;
}

export default function CreateLocationModal({
  locations,
  onClose,
  onCreated,
}: CreateLocationModalProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ordered = [...locations].sort((a, b) => a.name.localeCompare(b.name));

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Введите название локации.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createLocation({
        name: name.trim(),
        parentId: parentId === "" ? null : Number(parentId),
      });
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось создать локацию.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Новая локация" onClose={onClose}>
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
        <span className="field__label">Родительская локация</span>
        <select
          value={parentId}
          onChange={(event) =>
            setParentId(event.target.value === "" ? "" : Number(event.target.value))
          }
        >
          <option value="">— верхний уровень —</option>
          {ordered.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="btn-row" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={submit}
          disabled={submitting || !name.trim()}
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
