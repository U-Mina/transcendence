import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { type ButtonVariant } from "./Button";

export { Button as ActionButton } from "./Button";

export type ActionLinkProps = LinkProps & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function ActionLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ActionLinkProps) {
  return (
    <Link className={`button button-${variant} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}
