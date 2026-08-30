interface StateMessageProps {
  variant: "loading" | "empty" | "error";
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function StateMessage({
  variant,
  title,
  description,
  action,
}: StateMessageProps) {
  return (
    <div className={variant === "error" ? "state state--error" : "state"} role={variant === "error" ? "alert" : "status"}>
      {variant === "loading" && <div className="spinner" aria-hidden="true" />}
      <div className="state__title">{title}</div>
      {description && <div>{description}</div>}
      {action && (
        <div className="btn-row" style={{ justifyContent: "center", marginTop: "0.9rem" }}>
          <button type="button" className="btn" onClick={action.onClick}>
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
