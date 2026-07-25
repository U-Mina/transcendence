import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from "./Icon";

export type AlertVariant = "error" | "success" | "warning" | "info";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
  children?: ReactNode;
};

export function Alert({
  variant = "info",
  title,
  icon,
  onDismiss,
  className = "",
  children,
  ...props
}: AlertProps) {
  const defaultIcons: Record<AlertVariant, ReactNode> = {
    error: <AlertCircleIcon size={18} />,
    success: <CheckCircleIcon size={18} />,
    warning: <AlertCircleIcon size={18} />,
    info: <InfoIcon size={18} />,
  };

  const displayIcon = icon !== undefined ? icon : defaultIcons[variant];
  const alertClasses = `alert alert-${variant} ${className}`.trim();

  return (
    <div className={alertClasses} role="alert" {...props}>
      {displayIcon && <div className="alert-icon">{displayIcon}</div>}
      <div className="alert-content">
        {title && <strong style={{ display: "block", marginBottom: "4px" }}>{title}</strong>}
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
