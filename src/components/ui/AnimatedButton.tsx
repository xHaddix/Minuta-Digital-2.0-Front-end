import type { ButtonHTMLAttributes, ReactNode } from "react";

export type AnimatedButtonVariant = "primary" | "secondary" | "ghost";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AnimatedButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

export function AnimatedButton({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const classes = [
    "ui-animated-button",
    `ui-animated-button--${variant}`,
    "session-action-button",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={classes} disabled={disabled || loading}>
      <span className="ui-animated-button__shine" aria-hidden="true" />
      <span>{loading ? "Cargando..." : children}</span>
    </button>
  );
}
