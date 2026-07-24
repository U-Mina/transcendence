import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "subtle" | "danger" | "ghost";

const classNameFor = (variant: Variant, className = "") =>
  `button button-${variant} ${className}`.trim();

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function ActionButton({
  variant = "primary",
  className,
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button type={type} className={classNameFor(variant, className)} {...props}>
      {children}
    </button>
  );
}

type ActionLinkProps = LinkProps & { variant?: Variant; children: ReactNode };

export function ActionLink({
  variant = "primary",
  className,
  children,
  ...props
}: ActionLinkProps) {
  return (
    <Link className={classNameFor(variant, className)} {...props}>
      {children}
    </Link>
  );
}
