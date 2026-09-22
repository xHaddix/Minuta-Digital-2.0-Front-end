import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { fetchUsers } from "../../services/user-service";
import type { UserListItem } from "../../types/auth";

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        if (!session?.residentialComplexId) {
          setUsers([]);
          return;
        }

        const data = await fetchUsers(
          session?.residentialComplexId,
          session?.user?.id,
        );
        setUsers(data);
      } catch {
        setError("No fue posible cargar los usuarios del conjunto.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [session?.residentialComplexId]);

  return (
    <div className="users-page">
      <div className="users-header">
        <h1 className="users-title">Gestión de Usuarios</h1>
        <button type="button" className="users-primary-button">
          Invitar usuario
        </button>
      </div>

      {error ? <div className="users-alert">{error}</div> : null}

      <div className="users-table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="users-empty-row">
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="users-empty-row">
                  No hay usuarios disponibles para este conjunto.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="users-name-cell">{user.name}</td>
                  <td className="users-email-cell">{user.email}</td>
                  <td className="users-role-cell">
                    <span className="users-role-toggle">
                      <span className="users-role-toggle-knob" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
