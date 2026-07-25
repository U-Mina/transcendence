import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "default" | "soft" | "primary" | "danger" | "success" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
};

export function Badge({
  variant = "soft",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const sizeClass = size === "md" ? "" : `badge-${size}`;
  const badgeClasses = `badge badge-${variant} ${sizeClass} ${className}`.trim();

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
}
