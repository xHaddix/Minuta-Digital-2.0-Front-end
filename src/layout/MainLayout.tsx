import { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Can } from "../auth/Can";
import { ContextSelectorModal } from "../auth/ContextSelectorModal";
import { useAuth } from "../auth/useAuth";
import { roleLabels } from "../config/app";
import {
  fetchOrganizations,
  fetchResidentialComplexes,
} from "../services/auth-context";
import type { Organization, PermissionCode } from "../types/auth";
import type { ResidentialComplex } from "../types/user";
import { useNotifications } from "../notifications/useNotifications";

const navItems: Array<{
  label: string;
  to: string;
  permission: PermissionCode;
  icon: LucideIcon;
}> = [
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
    label: "Apartamentos",
    to: "/apartments",
    permission: "apartments:read",
    icon: Building2,
  },
  {
    label: "PQRS",
    to: "/dashboard",
    permission: "users:read",
    icon: FileText,
  },
];

export function MainLayout() {
  const { session, logout } = useAuth();
  const [isContextSelectorOpen, setIsContextSelectorOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [contextNames, setContextNames] = useState({
    organizationName: session?.organizationName ?? null,
    residentialComplexName: session?.residentialComplexName ?? null,
  });

  const roleCode = session?.user?.roleCode ?? "ROLE_RESIDENT";
  const canSwitchComplex =
    roleCode === "ROLE_DEV" ||
    roleCode === "ROLE_ORG_ADMIN" ||
    roleCode === "ROLE_COMPLEX_ADMIN";

  useEffect(() => {
    let isCancelled = false;

    setContextNames({
      organizationName: session?.organizationName ?? null,
      residentialComplexName: session?.residentialComplexName ?? null,
    });

    if (!session?.organizationId && !session?.residentialComplexId) {
      return;
    }

    const loadContextNames = async () => {
      const organizationsPromise = session.organizationName
        ? Promise.resolve([] as Organization[])
        : fetchOrganizations();
      const complexesPromise = session.residentialComplexName
        ? Promise.resolve([] as ResidentialComplex[])
        : fetchResidentialComplexes(session.organizationId);

      const [organizationsResult, complexesResult] = await Promise.allSettled([
        organizationsPromise,
        complexesPromise,
      ]);

      if (isCancelled) return;

      const organization =
        organizationsResult.status === "fulfilled"
          ? organizationsResult.value.find(
              (item) => item.id === session.organizationId,
            )
          : undefined;
      const complex =
        complexesResult.status === "fulfilled"
          ? complexesResult.value.find(
              (item) => item.id === session.residentialComplexId,
            )
          : undefined;

      setContextNames((current) => ({
        organizationName:
          current.organizationName ?? organization?.name ?? null,
        residentialComplexName:
          current.residentialComplexName ?? complex?.name ?? null,
      }));
    };

    void loadContextNames();

    return () => {
      isCancelled = true;
    };
  }, [
    session?.organizationId,
    session?.organizationName,
    session?.residentialComplexId,
    session?.residentialComplexName,
  ]);

  useNotifications({
    accessToken: session?.accessToken,
    residentialComplexId: session?.residentialComplexId,
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    logout();
  };

  return (
    <div className="layout-shell">
      {isContextSelectorOpen ? (
        <ContextSelectorModal onClose={() => setIsContextSelectorOpen(false)} />
      ) : null}
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
              perform={item.permission}
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
            {canSwitchComplex && (
              <button
                type="button"
                className="context-switcher"
                onClick={() => setIsContextSelectorOpen(true)}
                title="Cambiar organización o conjunto residencial"
              >
                <Building2 size={17} strokeWidth={2} />
                <span className="context-switcher-copy">
                  <small>
                    {contextNames.organizationName ?? "Organización activa"}
                  </small>
                  <strong>
                    {contextNames.residentialComplexName ?? "Conjunto actual"}
                  </strong>
                </span>
                <ChevronDown size={16} strokeWidth={2} />
              </button>
            )}

            <button
              type="button"
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
