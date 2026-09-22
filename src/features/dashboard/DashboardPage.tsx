import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import {
  fetchUsers,
  fetchVisitors,
  markVisitorExit,
} from "../../services/user-service";
import type { UserListItem, VisitorListItem } from "../../types/auth";

const formatTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function DashboardPage() {
  const { session } = useAuth();
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingVisitorId, setProcessingVisitorId] = useState<string | null>(
    null,
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [visitorData, userData] = await Promise.all([
        fetchVisitors(),
        fetchUsers(session?.residentialComplexId, session?.user?.id),
      ]);
      setVisitors(visitorData);
      setUsers(userData);
    } catch {
      setError("No fue posible cargar los datos del conjunto en este momento.");
      setVisitors([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [session?.residentialComplexId]);

  const metrics = useMemo(() => {
    const activeVisitors = visitors.filter((item) => !item.exitTime).length;
    const pendingUsers = users.filter(
      (item) => item.status === "PENDING",
    ).length;

    return [
      {
        title: "Visitantes hoy",
        value: String(visitors.length),
        meta: `${activeVisitors} activos ahora`,
      },
      {
        title: "Activos en conjunto",
        value: String(activeVisitors),
        meta: `${visitors.length - activeVisitors} con salida registrada`,
      },
      {
        title: "Usuarios del conjunto",
        value: String(users.length),
        meta: `${pendingUsers} pendientes por activar`,
      },
      {
        title: "Solicitudes por revisar",
        value: String(pendingUsers || 0),
        meta: pendingUsers > 0 ? "Requieren atención" : "Sin pendientes",
      },
    ];
  }, [users, visitors]);

  const handleCheckOut = async (visitorId: string) => {
    try {
      setProcessingVisitorId(visitorId);
      await markVisitorExit(visitorId);
      await loadDashboardData();
    } catch {
      setError("No fue posible registrar la salida del visitante.");
    } finally {
      setProcessingVisitorId(null);
    }
  };

  return (
    <div className="dashboard-view">
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

      <div className="table-card">
        <div className="section-header">
          <h3>Visitas del conjunto</h3>
          <button type="button" className="inline-button">
            Registrar ingreso
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Unidad / Apto</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Cargando movimientos del conjunto...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No hay visitantes registrados para este conjunto.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => {
                  const status = visitor.exitTime ? "SALIDA" : "ENTRÓ";
                  const isActive = !visitor.exitTime;

                  return (
                    <tr key={visitor.id}>
                      <td>{visitor.fullName}</td>
                      <td>{visitor.documentNumber ?? "—"}</td>
                      <td>{visitor.unitTarget ?? visitor.unitNumber ?? "—"}</td>
                      <td>{formatTime(visitor.entryTime)}</td>
                      <td>{formatTime(visitor.exitTime)}</td>
                      <td>
                        <span
                          className={`status-badge ${isActive ? "success" : "warning"}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="inline-button"
                          disabled={
                            processingVisitorId === visitor.id || !isActive
                          }
                          onClick={() => handleCheckOut(visitor.id)}
                        >
                          {processingVisitorId === visitor.id
                            ? "Procesando..."
                            : "Check out"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
