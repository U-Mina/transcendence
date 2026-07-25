import type { HTMLAttributes, ReactNode } from "react";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  size?: "default" | "small";
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  size = "default",
  className = "",
  ...props
}: EmptyStateProps) {
  const sizeClass = size === "small" ? "small" : "";
  return (
    <div className={`empty-state-ui ${sizeClass} ${className}`.trim()} {...props}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: "12px" }}>{action}</div>}
    </div>
  );
}
