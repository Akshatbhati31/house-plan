import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="page-head-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title display">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatBlock({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="stat-block">
      {icon && <span className="stat-icon">{icon}</span>}
      <span className="stat-label">{label}</span>
      <strong className="stat-value mono">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}
