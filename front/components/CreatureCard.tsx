import type { Creature } from "../lib/types";

const KNOWN_BADGES = new Set(["hero", "beast", "spirit"]);

interface CreatureCardProps {
  creature: Creature;
  onSelect: (creature: Creature) => void;
}

export default function CreatureCard({ creature, onSelect }: CreatureCardProps) {
  const badgeClass = KNOWN_BADGES.has(creature.type.name)
    ? `badge badge--${creature.type.name}`
    : "badge";

  return (
    <button
      type="button"
      className="card"
      onClick={() => onSelect(creature)}
      aria-label={`Открыть карточку: ${creature.name}`}
    >
      <img
        className="card__cover"
        src={`/covers/${creature.coverLink}`}
        alt=""
        loading="lazy"
        onError={(event) => {
          const img = event.currentTarget as HTMLImageElement;
          if (!img.src.endsWith("_placeholder.svg")) {
            img.src = "/covers/_placeholder.svg";
          }
        }}
      />
      <div className="card__body">
        <h3 className="card__name">{creature.name}</h3>
        <span className={badgeClass}>{creature.type.name}</span>
      </div>
    </button>
  );
}
