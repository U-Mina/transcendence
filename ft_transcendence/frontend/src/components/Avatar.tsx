import type { HTMLAttributes } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  alt?: string;
};

export function Avatar({
  src,
  name = "?",
  size = "md",
  alt,
  className = "",
  style,
  ...props
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = `avatar-${size}`;

  return (
    <div
      className={`avatar-ui ${sizeClass} ${className}`.trim()}
      role={alt ? "img" : undefined}
      aria-label={alt || name}
      style={style}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || ""}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}
