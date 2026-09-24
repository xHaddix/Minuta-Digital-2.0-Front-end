import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ContextSelectorModal } from "./ContextSelectorModal";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, hasActiveComplex, session } = useAuth();
  const roleCode = session?.user?.roleCode ?? null;
  const requiresContextSelection =
    Boolean(session?.accessToken) &&
    (roleCode === "ROLE_DEV" || roleCode === "ROLE_ORG_ADMIN") &&
    (session?.contextSelected !== true || !session?.residentialComplexId);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiresContextSelection) {
    return <ContextSelectorModal />;
  }

  if (!hasActiveComplex()) {
    return (
      <div className="context-required-state">
        <div className="context-required-card">
          <h2>Debe seleccionar un conjunto residencial activo</h2>
          <p>
            Tu perfil requiere un contexto de conjunto activo para operar con la
            plataforma.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
