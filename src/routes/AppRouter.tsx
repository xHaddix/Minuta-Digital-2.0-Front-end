import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { Can } from "../auth/Can";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
import { ActivateAccountPage } from "../features/auth/ActivateAccountPage";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { VisitorsPage } from "../features/visitors/VisitorsPage";
import { UsersPage } from "../features/users/UsersPage";
import { MainLayout } from "../layout/MainLayout";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />
      <Route path="/auth/activate" element={<ActivateAccountPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="visitors"
          element={
            <Can
              perform="visitors:read"
              fallback={
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                  No tiene permisos para visitar esta pantalla.
                </div>
              }
            >
              <VisitorsPage />
            </Can>
          }
        />

        <Route
          path="users"
          element={
            <Can
              perform="users:read"
              fallback={
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                  No tiene permisos para visitar esta pantalla.
                </div>
              }
            >
              <UsersPage />
            </Can>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
