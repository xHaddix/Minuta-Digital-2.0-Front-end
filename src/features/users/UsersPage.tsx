import React, { useEffect, useMemo, useState } from "react";
import { fetchUsers, deleteUser } from "../../services/user-service";
import { InviteUserModal } from "./components/InviteUserModal";
import { EditUserModal } from "./components/EditUserModel";
import { useAuth } from "../../auth/useAuth";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import type { User } from "../../types/user";
import { CheckIcon } from "../../components/icons/CheckIcon";
import { EditIcon } from "../../components/icons/EditIcon";
import { TrashIcon } from "../../components/icons/TrashIcon";

export const UsersPage: React.FC = () => {
  const { session } = useAuth();
  const currentUser = session?.user;
  const currentUserRoleCode =
    session?.roleCode || session?.user?.roleCode || "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro por rol
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  // Estados para modales
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null,
  );

  // Estados para eliminación / desactivación
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(message || "Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await deleteUser(userToDelete.id);
      setActionSuccess(response.message || "Acción ejecutada correctamente.");
      setUserToDelete(null);
      await loadUsers();

      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(message || "No se pudo completar la eliminación del usuario.");
    } finally {
      setDeleting(false);
    }
  };

  // Opciones del selector de roles
  const roleOptions: SelectOption[] = useMemo(() => {
    const rolesMap = new Map<string, string>();
    users.forEach((u) => {
      if (u.role?.id && u.role?.name) {
        rolesMap.set(u.role.id, u.role.name);
      }
    });

    const options: SelectOption[] = [
      { value: "ALL", label: "Todos los roles" },
    ];
    rolesMap.forEach((name, id) => {
      options.push({ value: id, label: name });
    });

    return options;
  }, [users]);

  // Lista filtrada por rol
  const filteredUsers = useMemo(() => {
    if (selectedRoleFilter === "ALL") return users;
    return users.filter((u) => u.role?.id === selectedRoleFilter);
  }, [users, selectedRoleFilter]);

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span
            className="status-badge success"
            style={{
              borderRadius: "9999px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            ACTIVO
          </span>
        );
      case 0:
        return (
          <span
            className="status-badge warning"
            style={{
              borderRadius: "9999px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            INACTIVO
          </span>
        );
      case 2:
        return (
          <span
            className="status-badge warning"
            style={{
              borderRadius: "9999px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            PENDIENTE
          </span>
        );
      default:
        return (
          <span
            className="status-badge"
            style={{
              borderRadius: "9999px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            DESCONOCIDO
          </span>
        );
    }
  };

  return (
    <div className="dashboard-view">
      <div
        className="table-card"
        style={{
          background: "#0b132b",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "1.25rem",
        }}
      >
        {/* Encabezado con título, select de roles y botón Invitar usuario */}
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Gestión de Usuarios
            </h2>
            <CustomSelect
              options={roleOptions}
              value={selectedRoleFilter}
              onChange={setSelectedRoleFilter}
              placeholder="Todos los roles"
            />
          </div>
          <button
            type="button"
            className="inline-button"
            style={{
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
            onClick={() => setIsInviteOpen(true)}
          >
            Invitar usuario
          </button>
        </div>

        {actionSuccess && (
          <div
            className="dashboard-alert success"
            style={{ marginBottom: "1rem" }}
          >
            <CheckIcon /> {actionSuccess}
          </div>
        )}

        {error && (
          <div className="dashboard-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="table-wrap">
          <table
            className="data-table"
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 0.5rem",
            }}
          >
            <thead>
              <tr
                style={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "0.75rem 1rem" }}>USUARIO / CORREO</th>
                <th style={{ padding: "0.75rem 1rem" }}>DOCUMENTO</th>
                <th style={{ padding: "0.75rem 1rem" }}>TELÉFONO</th>
                <th style={{ padding: "0.75rem 1rem" }}>ROL</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  ESTADO
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-row"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-row"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;

                  // Formato exacto de documento: CC - 123132132
                  const documentStr =
                    u.documentType && u.documentNumber
                      ? `${u.documentType.code} - ${u.documentNumber}`
                      : "—";

                  return (
                    <tr
                      key={u.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      {/* USUARIO / CORREO con indicador (Tú) */}
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#fff",
                            fontSize: "0.95rem",
                          }}
                        >
                          {u.name}{" "}
                          {isSelf && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#3b82f6",
                                fontWeight: 600,
                              }}
                            >
                              (Tú)
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.85rem",
                            marginTop: "0.15rem",
                          }}
                        >
                          {u.email}
                        </div>
                      </td>

                      {/* DOCUMENTO (CC - 123132132) */}
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          color: "#e2e8f0",
                          fontSize: "0.9rem",
                        }}
                      >
                        {documentStr}
                      </td>

                      {/* TELÉFONO */}
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          color: "#e2e8f0",
                          fontSize: "0.9rem",
                        }}
                      >
                        {u.phone || "—"}
                      </td>

                      {/* ROL en Pill */}
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "6px",
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.825rem",
                            color: "#e2e8f0",
                            display: "inline-block",
                          }}
                        >
                          {u.role?.name || "Sin Rol"}
                        </span>
                      </td>

                      {/* ESTADO */}
                      <td
                        style={{ padding: "0.75rem 1rem", textAlign: "right" }}
                      >
                        {renderStatusBadge(u.status)}
                      </td>

                      {/* ACCIONES (Iconos Lápiz y Papelera) */}
                      <td
                        style={{ padding: "0.75rem 1rem", textAlign: "right" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="inline-button"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              padding: "0.4rem",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Editar usuario"
                            onClick={() => setSelectedUserForEdit(u)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="inline-button"
                            style={{
                              background: isSelf
                                ? "rgba(239, 68, 68, 0.05)"
                                : "rgba(239, 68, 68, 0.15)",
                              color: isSelf ? "#fca5a5" : "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              padding: "0.4rem",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isSelf ? "not-allowed" : "pointer",
                            }}
                            onClick={() => setUserToDelete(u)}
                            disabled={isSelf}
                            title={
                              isSelf
                                ? "No puedes eliminar tu propia cuenta"
                                : u.status === 2
                                  ? "Eliminar invitación pendiente"
                                  : "Desactivar usuario"
                            }
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Invitar Usuario */}
      <InviteUserModal
        isOpen={isInviteOpen}
        currentUserRoleCode={currentUserRoleCode}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => void loadUsers()}
      />

      {/* Modal para Editar Usuario */}
      <EditUserModal
        isOpen={Boolean(selectedUserForEdit)}
        user={selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onSuccess={() => void loadUsers()}
      />

      {/* Modal de Confirmación de Eliminación / Desactivación */}
      {userToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>
              {userToDelete.status === 2
                ? "Eliminar Invitación Pendiente"
                : "Desactivar Usuario"}
            </h3>
            <p style={{ marginTop: "1rem", color: "#94a3b8" }}>
              {userToDelete.status === 2 ? (
                <>
                  ¿Estás seguro de que deseas eliminar permanentemente la
                  invitación para <strong>{userToDelete.email}</strong>? Esta
                  acción borrará la cuenta y el token de activación.
                </>
              ) : (
                <>
                  ¿Estás seguro de que deseas desactivar al usuario{" "}
                  <strong>{userToDelete.name}</strong> ({userToDelete.email})?
                  El usuario perderá el acceso a la plataforma pero se
                  conservará su historial operativo.
                </>
              )}
            </p>

            <div
              className="modal-actions"
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="inline-button"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-button"
                style={{ background: "#ef4444", color: "#fff" }}
                onClick={() => void handleDeleteConfirm()}
                disabled={deleting}
              >
                {deleting
                  ? "Procesando..."
                  : userToDelete.status === 2
                    ? "Sí, Eliminar"
                    : "Sí, Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
