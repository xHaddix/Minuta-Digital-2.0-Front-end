import type { ReactNode } from "react";

export type FormFeedbackVariant = "error" | "success" | "info";

interface FormFeedbackProps {
  variant?: FormFeedbackVariant;
  children: ReactNode;
  className?: string;
}

export function FormFeedback({
  variant = "info",
  children,
  className = "",
}: FormFeedbackProps) {
  return (
    <div
      className={["form-feedback", `form-feedback--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
