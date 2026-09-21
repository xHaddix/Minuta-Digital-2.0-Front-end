import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, hasActiveComplex } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasActiveComplex()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Debe seleccionar un conjunto residencial activo
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Debe seleccionar un conjunto residencial activo para operar.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
