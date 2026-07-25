import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "subtle" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "wide";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconPrefix,
  iconSuffix,
  className = "",
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const sizeClass = size === "md" ? "" : size === "wide" ? "wide" : size === "sm" ? "small" : "large";
  const btnClasses = `button button-${variant} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={btnClasses}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderRightColor: "transparent",
            borderRadius: "50%",
            marginRight: children ? "8px" : "0",
            animation: "spin 0.75s linear infinite",
          }}
          aria-hidden="true"
        />
      )}
      {!loading && iconPrefix && (
        <span style={{ display: "inline-flex", marginRight: children ? "6px" : "0" }}>
          {iconPrefix}
        </span>
      )}
      {children}
      {!loading && iconSuffix && (
        <span style={{ display: "inline-flex", marginLeft: children ? "6px" : "0" }}>
          {iconSuffix}
        </span>
      )}
    </button>
  );
}
