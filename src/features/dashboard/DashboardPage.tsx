import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import {
  fetchUsers,
  fetchVisitors,
  markVisitorExit,
} from "../../services/user-service";
import type { UserListItem, VisitorListItem } from "../../types/auth";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";

const formatTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Opciones estáticas para el filtro de tabla de visitantes
const VISITOR_FILTER_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Todas las visitas" },
  { value: "INSIDE", label: "Solo en conjunto (Activos)" },
  { value: "EXITED", label: "Solo con salida" },
];

export function DashboardPage() {
  const { session, can } = useAuth();
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingVisitorId, setProcessingVisitorId] = useState<string | null>(
    null,
  );

  // Estado para el selector animado de filtro de la tabla
  const [visitorFilter, setVisitorFilter] = useState("ALL");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        can("visitors:read") ? fetchVisitors() : Promise.resolve([]),
        can("users:read") ? fetchUsers() : Promise.resolve([]),
      ]);

      const [visitorsResult, usersResult] = results;

      if (visitorsResult.status === "fulfilled") {
        setVisitors(visitorsResult.value);
      } else {
        console.error("Error al obtener visitantes:", visitorsResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        console.error("Error al obtener usuarios:", usersResult.reason);
      }

      if (
        visitorsResult.status === "rejected" &&
        usersResult.status === "rejected"
      ) {
        setError(
          "No fue posible consultar la información del conjunto residencial.",
        );
      }
    } catch {
      setError("Error inesperado al procesar la información del conjunto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [session?.residentialComplexId, session?.accessToken]);

  const filteredVisitors = useMemo(() => {
    if (visitorFilter === "INSIDE") {
      return visitors.filter((item) => !item.exitTime);
    }
    if (visitorFilter === "EXITED") {
      return visitors.filter((item) => Boolean(item.exitTime));
    }
    return visitors;
  }, [visitors, visitorFilter]);

  const metrics = useMemo(() => {
    const activeVisitors = visitors.filter((item) => !item.exitTime).length;

    const pendingUsers = users.filter(
      (item) =>
        item.status === "PENDING" ||
        item.status === "INACTIVE" ||
        (item.status as unknown) === 0,
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
        value: String(pendingUsers),
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
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h3>Visitas del conjunto</h3>
            {/* Integracion del CustomSelect animado para el filtro */}
            <CustomSelect
              options={VISITOR_FILTER_OPTIONS}
              value={visitorFilter}
              onChange={setVisitorFilter}
              placeholder="Filtrar estado"
            />
          </div>

          {can("visitors:create") && (
            <button type="button" className="inline-button">
              Registrar ingreso
            </button>
          )}
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
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No hay visitantes que coincidan con el filtro.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => {
                  const isActive = !visitor.exitTime;
                  const status = isActive ? "ENTRÓ" : "SALIDA";

                  return (
                    <tr key={visitor.id}>
                      <td>{visitor.fullName}</td>
                      <td>{visitor.documentNumber ?? "—"}</td>
                      <td>{visitor.unitTarget ?? visitor.unitNumber ?? "—"}</td>
                      <td>{formatTime(visitor.entryTime)}</td>
                      <td>{formatTime(visitor.exitTime)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            isActive ? "success" : "warning"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {can("visitors:check_out") && (
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
                        )}
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
