import CreatureCard from "./CreatureCard";
import StateMessage from "./StateMessage";
import type { Creature } from "../lib/types";

interface CreatureGridProps {
  creatures: Creature[];
  status: "loading" | "error" | "ready";
  error?: string;
  onRetry: () => void;
  onSelect: (creature: Creature) => void;
}

export default function CreatureGrid({
  creatures,
  status,
  error,
  onRetry,
  onSelect,
}: CreatureGridProps) {
  if (status === "loading") {
    return (
      <StateMessage variant="loading" title="Загрузка существ…" />
    );
  }

  if (status === "error") {
    return (
      <StateMessage
        variant="error"
        title="Не удалось загрузить данные"
        description={error}
        action={{ label: "Повторить", onClick: onRetry }}
      />
    );
  }

  if (creatures.length === 0) {
    return (
      <StateMessage
        variant="empty"
        title="Ничего не найдено"
        description="Измените фильтры или добавьте новое существо."
      />
    );
  }

  return (
    <div className="grid">
      {creatures.map((creature) => (
        <CreatureCard
          key={creature.id}
          creature={creature}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
