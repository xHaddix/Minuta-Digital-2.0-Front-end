import { useEffect, useState } from "react";
import { fetchVisitors } from "../../services/user-service";
import type { VisitorListItem } from "../../types/auth";

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchVisitors();
        setVisitors(data);
      } catch {
        setError("No fue posible cargar la minuta de visitantes.");
        setVisitors([]);
      } finally {
        setLoading(false);
      }
    };

    void loadVisitors();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Control de Visitantes
        </h1>
        <button className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white">
          Registrar ingreso
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Cargando visitantes...
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No hay registros de visitantes para este conjunto.
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{visitor.fullName}</td>
                  <td className="px-4 py-3">{visitor.unitNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${visitor.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {visitor.status === "active" ? "Activo" : "Finalizado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{visitor.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
