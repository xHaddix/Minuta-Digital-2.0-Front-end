import { useState } from "react";

const mockVisitors = [
  {
    id: "1",
    fullName: "Ana García",
    unitNumber: "A-102",
    status: "active",
    createdAt: "2026-09-20 09:15",
  },
  {
    id: "2",
    fullName: "Luis Pérez",
    unitNumber: "B-204",
    status: "closed",
    createdAt: "2026-09-20 08:30",
  },
  {
    id: "3",
    fullName: "Marina Ruiz",
    unitNumber: "C-310",
    status: "active",
    createdAt: "2026-09-20 10:05",
  },
];

export function VisitorsPage() {
  const [visitors] = useState(mockVisitors);

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
            {visitors.map((visitor) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
