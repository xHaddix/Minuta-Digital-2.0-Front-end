import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { fetchUsers } from "../../services/user-service";
import type { UserListItem } from "../../types/auth";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import { InviteUserModal } from "./components/InviteUserModal";

// Mapeo de estados de usuario (status: 1 = ACTIVO, 2 = PENDIENTE, 0 = INACTIVO)
const USER_STATUS_MAP: Record<number, { label: string; badgeClass: string }> = {
  1: { label: "ACTIVO", badgeClass: "success" },
  2: { label: "PENDIENTE", badgeClass: "warning" },
  0: { label: "INACTIVO", badgeClass: "danger" },
};

export function UsersPage() {
  const { session, can } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para controlar la apertura del modal de invitación
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Estado para el filtro por rol
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!session?.user) {
        setUsers([]);
        return;
      }

      // Invocación a la API acotada por el backend vía JWT
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      setError("No fue posible cargar los usuarios del sistema.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsersData();
  }, [session?.user?.id]);

  // Generación dinámica de opciones de filtro de rol según los usuarios cargados
  const roleFilterOptions: SelectOption[] = useMemo(() => {
    const rolesMap = new Map<string, string>();
    rolesMap.set("ALL", "Todos los roles");

    users.forEach((user) => {
      if (user.role?.code && user.role?.name) {
        rolesMap.set(user.role.code, user.role.name);
      }
    });

    return Array.from(rolesMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [users]);

  // Filtrado de usuarios en memoria
  const filteredUsers = useMemo(() => {
    if (roleFilter === "ALL") return users;
    return users.filter((u) => u.role?.code === roleFilter);
  }, [users, roleFilter]);

  // Tarjetas Métricas de resumen
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 1).length;
    const pendingUsers = users.filter((u) => u.status === 2).length;

    return [
      {
        title: "Total usuarios",
        value: String(totalUsers),
        meta: "Registrados en el sistema",
      },
      {
        title: "Usuarios activos",
        value: String(activeUsers),
        meta: `${totalUsers - activeUsers} inactivos o pendientes`,
      },
      {
        title: "Pendientes por activar",
        value: String(pendingUsers),
        meta: pendingUsers > 0 ? "Requieren confirmación" : "Sin pendientes",
      },
    ];
  }, [users]);

  return (
    <div className="dashboard-view">
      {/* Tarjetas Métricas */}
      <div className="dashboard-grid">
        {metrics.map((card) => (
          <article key={card.title} className="metric-card">
            <div className="label">{card.title}</div>
            <div className="value">{card.value}</div>
            <div className="meta">{card.meta}</div>
          </article>
        ))}
      </div>

      {error ? <div className="dashboard-alert">{error}</div> : null}

      {/* Tarjeta de Tabla Estilizada */}
      <div className="table-card">
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h3>Gestión de Usuarios</h3>
            <CustomSelect
              options={roleFilterOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Filtrar por rol"
            />
          </div>

          {can("users:create") && (
            <button
              type="button"
              className="inline-button"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invitar usuario
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario / Correo</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    No hay usuarios disponibles para mostrar.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const statusInfo = USER_STATUS_MAP[Number(user.status)] ?? {
                    label: "DESCONOCIDO",
                    badgeClass: "warning",
                  };

                  const docTypeCode = user.documentType?.code;
                  const docNumber = user.documentNumber;
                  const documentDisplay =
                    docTypeCode && docNumber
                      ? `${docTypeCode} - ${docNumber}`
                      : (docNumber ?? "—");

                  return (
                    <tr key={user.id}>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <strong style={{ color: "#f8fafc" }}>
                            {user.name}
                          </strong>
                          <span
                            style={{ fontSize: "0.8125rem", color: "#94a3b8" }}
                          >
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td>{documentDisplay}</td>
                      <td>{user.phone ?? "—"}</td>
                      <td>
                        <span className="role-tag">
                          {user.role?.name ?? user.roleCode}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Componente Modal de Invitación */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={loadUsersData}
        currentUserRoleCode={session?.user?.roleCode || ""}
      />
    </div>
  );
}
