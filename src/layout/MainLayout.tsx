import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Can } from "../auth/Can";
import { useAuth } from "../auth/useAuth";
import { roleLabels } from "../config/app";
import { fetchResidentialComplexes } from "../services/auth-context";
import type { ResidentialComplex } from "../types/auth";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    permission: "events:read",
    icon: LayoutDashboard,
  },
  {
    label: "Visitantes",
    to: "/visitors",
    permission: "visitors:read",
    icon: UserRound,
  },
  {
    label: "Usuarios",
    to: "/users",
    permission: "users:read",
    icon: UsersRound,
  },
  {
    label: "PQRS",
    to: "/dashboard",
    permission: "users:read",
    icon: FileText,
  },
];

export function MainLayout() {
  const { session, logout, switchComplex } = useAuth();
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [isComplexLoading, setIsComplexLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleCode = session?.user?.roleCode ?? "ROLE_RESIDENT";

  useEffect(() => {
    const loadComplexes = async () => {
      if (!["ROLE_DEV", "ROLE_ORG_ADMIN"].includes(roleCode)) {
        return;
      }

      try {
        setIsComplexLoading(true);
        const data = await fetchResidentialComplexes();
        setComplexes(data);
      } catch {
        setComplexes([]);
      } finally {
        setIsComplexLoading(false);
      }
    };

    void loadComplexes();
  }, [roleCode]);

  const handleComplexChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) return;
    await switchComplex(value);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    logout();
  };

  return (
    <div className="layout-shell">
      {isLoggingOut ? (
        <div
          className="auth-transition-overlay auth-transition-overlay--logout"
          aria-live="polite"
        >
          <div className="auth-transition-card">
            <div className="auth-transition-spinner" aria-hidden="true" />
            <div>
              <strong>Cerrando sesión</strong>
              <span>Guardando tu sesión y redirigiendo...</span>
            </div>
          </div>
        </div>
      ) : null}

      <aside id="app-sidebar" className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-group">
            <div className="brand-mark">
              <Building2 size={20} strokeWidth={2.1} />
            </div>
            <div className="brand-name">
              Minuta
              <span>Digital</span>
            </div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <Can
              key={item.to + item.label}
              perform={item.permission as any}
              fallback={null}
            >
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">
                  <item.icon size={16} strokeWidth={2.1} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            </Can>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="inline-button session-action-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            Cerrar menú
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-group">
            <div className="user-pill">
              <div className="avatar">
                <ShieldCheck size={14} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-muted">
                  {roleLabels[roleCode] ?? roleCode}
                </div>
                <strong>{session?.user?.name ?? "Admin Demo"}</strong>
              </div>
            </div>
          </div>

          <div className="topbar-group">
            {(roleCode === "ROLE_DEV" || roleCode === "ROLE_ORG_ADMIN") && (
              <div className="custom-select-wrap">
                <select
                  className="complex-select"
                  onChange={handleComplexChange}
                  value={session?.residentialComplexId ?? ""}
                  disabled={isComplexLoading || complexes.length === 0}
                >
                  <option value="">Selecciona un conjunto</option>
                  {complexes.map((complex) => (
                    <option key={complex.id} value={complex.id}>
                      {complex.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">
                  <ChevronDown size={16} strokeWidth={2.2} />
                </span>
              </div>
            )}

            <button
              className="inline-button session-action-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={14} strokeWidth={2.2} />
              <span>{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}</span>
            </button>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
