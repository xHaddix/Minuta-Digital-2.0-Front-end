import type { ReactNode } from "react";
import type { PermissionCode } from "../types/auth";
import { useAuth } from "./useAuth";

interface CanProps {
  perform: PermissionCode;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ perform, children, fallback = null }: CanProps) {
  const { can } = useAuth();

  if (!can(perform)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
