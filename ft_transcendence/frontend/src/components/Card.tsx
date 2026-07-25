import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
  children: ReactNode;
};

export function Card({
  hoverable = false,
  className = "",
  children,
  ...props
}: CardProps) {
  const hoverClass = hoverable ? "card-hover" : "";
  return (
    <div className={`card ${hoverClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export function CardTitle({ className = "", children, ...props }: CardTitleProps) {
  return (
    <h3 className={`card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardBody({ className = "", children, ...props }: CardBodyProps) {
  return (
    <div className={`card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
