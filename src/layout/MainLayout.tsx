import { useState } from "react";
import type { ChangeEvent } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Can } from "../auth/Can";
import { useAuth } from "../auth/useAuth";
import { roleLabels } from "../config/app";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    permission: "events:read",
    icon: "▣",
  },
  {
    label: "Visitantes",
    to: "/visitors",
    permission: "visitors:read",
    icon: "◌",
  },
  { label: "Usuarios", to: "/users", permission: "users:read", icon: "◍" },
  { label: "PQRS", to: "/dashboard", permission: "users:read", icon: "☰" },
];

export function MainLayout() {
  const { session, logout, switchComplex } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleCode = session?.user?.roleCode ?? "ROLE_RESIDENT";

  const handleComplexChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) return;
    await switchComplex(value);
  };

  return (
    <div className="layout-shell">
      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">M</div>
          <div className="brand-name">
            Minuta
            <span>Digital</span>
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
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </Can>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="inline-button" onClick={logout}>
            Cerrar menú
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-group">
            <button
              className="inline-button"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              ☰
            </button>
            <div className="user-pill">
              <div className="avatar">AD</div>
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
              <select
                className="complex-select"
                onChange={handleComplexChange}
                defaultValue=""
              >
                <option value="">Conjunto residencial Demo</option>
                <option value="complex-1">Conjunto residencial Demo</option>
                <option value="complex-2">Conjunto residencial Norte</option>
              </select>
            )}

            <button className="inline-button" onClick={logout}>
              Cerrar sesión
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
