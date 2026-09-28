import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";
// Dominio Central: Usuarios
import { fetchUsers } from "../../services/user-service";
// Dominio Tenant-Schema: Visitantes
import { fetchVisitors, markVisitorExit } from "../../services/visitor-service";
import type { User } from "../../types/user";
import type { VisitorListItem } from "../../types/visitor";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import { isVisitorActive } from "../visitors/visitor-status.mjs";
import { countPendingActivationUsers, getDashboardUsers } from "./dashboard-users.mjs";

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
  const activeComplexId = session?.residentialComplexId ?? session?.user?.residentialComplexId ?? null;
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingVisitorId, setProcessingVisitorId] = useState<string | null>(
    null,
  );

  // Estado para el selector animado de filtro de la tabla
  const [visitorFilter, setVisitorFilter] = useState("ALL");

  const loadDashboardData = useCallback(async () => {
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
  }, [can]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData, activeComplexId, session?.accessToken]);

  const usersInActiveComplex = useMemo(
    () => getDashboardUsers(users, activeComplexId),
    [users, activeComplexId],
  );

  const filteredVisitors = useMemo(() => {
    if (visitorFilter === "INSIDE") {
      return visitors.filter(isVisitorActive);
    }
    if (visitorFilter === "EXITED") {
      return visitors.filter((item) => !isVisitorActive(item));
    }
    return visitors;
  }, [visitors, visitorFilter]);
  const showCheckoutActions = can("visitors:check_out") && filteredVisitors.some(isVisitorActive);

  const metrics = useMemo(() => {
    const activeVisitors = visitors.filter(isVisitorActive).length;
    const now = new Date();
    const visitorsToday = visitors.filter((visitor) => {
      if (!visitor.entryTime) return false;
      const entryDate = new Date(visitor.entryTime);
      return !Number.isNaN(entryDate.getTime()) &&
        entryDate.getFullYear() === now.getFullYear() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getDate() === now.getDate();
    }).length;
    const pendingUsers = countPendingActivationUsers(usersInActiveComplex);

    return [
      {
        title: "Visitantes hoy",
        value: String(visitorsToday),
        meta: `${activeVisitors} dentro del conjunto ahora`,
      },
      {
        title: "Usuarios del conjunto",
        value: String(usersInActiveComplex.length),
        meta: `${pendingUsers} pendientes por activar`,
      },
    ];
  }, [usersInActiveComplex, visitors]);

  const visibleMetrics =
    session?.roleCode === "ROLE_RESIDENT"
      ? metrics.filter(
          (card) =>
            card.title !== "Usuarios del conjunto",
        )
      : metrics;

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
    <div className="dashboard-view dashboard-page">
      <div className="dashboard-grid">
        {visibleMetrics.map((card) => (
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
            <CustomSelect
              options={VISITOR_FILTER_OPTIONS}
              value={visitorFilter}
              onChange={setVisitorFilter}
              placeholder="Filtrar estado"
            />
          </div>

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
                {showCheckoutActions && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showCheckoutActions ? 7 : 6} className="empty-row">
                    Cargando movimientos del conjunto...
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={showCheckoutActions ? 7 : 6} className="empty-row">
                    No hay visitantes que coincidan con el filtro.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => {
                  const isActive = isVisitorActive(visitor);
                  const status = isActive ? "ENTRÓ" : "SALIDA";

                  return (
                    <tr key={visitor.id}>
                      <td data-label="Visitante">{visitor.fullName}</td>
                      <td data-label="Documento">{visitor.documentNumber ?? "—"}</td>
                      <td data-label="Unidad / apto">{visitor.unitTarget ?? visitor.unitNumber ?? "—"}</td>
                      <td data-label="Ingreso">{formatTime(visitor.entryTime)}</td>
                      <td data-label="Salida">{formatTime(visitor.exitTime)}</td>
                      <td data-label="Estado">
                        <span
                          className={`status-badge ${
                            isActive ? "success" : "warning"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      {showCheckoutActions && <td data-label="Acción">
                        {isActive && (
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
                              : "Registrar salida"}
                          </button>
                        )}
                      </td>}
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
