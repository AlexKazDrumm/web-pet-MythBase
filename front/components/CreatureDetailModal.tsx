import { useEffect, useState } from "react";
import Modal from "./Modal";
import StateMessage from "./StateMessage";
import { ApiError, api } from "../lib/api";
import type { CreatureDetail } from "../lib/types";

interface CreatureDetailModalProps {
  creatureId: number;
  onClose: () => void;
}

export default function CreatureDetailModal({
  creatureId,
  onClose,
}: CreatureDetailModalProps) {
  const [detail, setDetail] = useState<CreatureDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setDetail(null);
    setError(null);
    api
      .getCreature(creatureId)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "Не удалось загрузить карточку.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [creatureId]);

  return (
    <Modal title={detail?.name ?? "Карточка существа"} onClose={onClose} wide>
      {error && (
        <StateMessage variant="error" title="Ошибка" description={error} />
      )}
      {!error && !detail && (
        <StateMessage variant="loading" title="Загрузка…" />
      )}
      {detail && (
        <div>
          <img
            className="card__cover"
            src={`/covers/${detail.coverLink}`}
            alt=""
            style={{ borderRadius: "8px", maxHeight: 260 }}
            onError={(event) => {
              const img = event.currentTarget as HTMLImageElement;
              if (!img.src.endsWith("_placeholder.svg")) {
                img.src = "/covers/_placeholder.svg";
              }
            }}
          />
          <p className="detail__meta" style={{ marginTop: "0.75rem" }}>
            Тип: {detail.type.name}
          </p>
          <p>{detail.description}</p>

          <div className="detail__section">
            <h4>Локации</h4>
            {detail.locations.length === 0 ? (
              <p className="detail__meta">Не указаны.</p>
            ) : (
              <ul className="chip-list">
                {detail.locations.map((location) => (
                  <li key={location.id} className="chip">
                    {location.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {detail.altNames.length > 0 && (
            <div className="detail__section">
              <h4>Другие имена</h4>
              <ul className="chip-list">
                {detail.altNames.map((alt) => (
                  <li key={alt} className="chip">
                    {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail.nativeNames.length > 0 && (
            <div className="detail__section">
              <h4>Исходные имена</h4>
              <ul className="chip-list">
                {detail.nativeNames.map((native) => (
                  <li key={native} className="chip">
                    {native}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
