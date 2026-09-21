import { useAuth } from "../../auth/useAuth";

const cards = [
  { title: "Visitantes hoy", value: "18", meta: "+3 vs. ayer" },
  { title: "Paquetes pendientes", value: "5", meta: "+2 vs. ayer" },
  { title: "PQRs abiertas", value: "2", meta: "+0 vs. ayer" },
  { title: "Turnos y mitina", value: "12", meta: "A tiempo" },
];

const visitors = [
  {
    name: "Carlos Ruiz",
    document: "1020340",
    unit: "Torre 2 - Apto 302",
    time: "08:30 AM",
    status: "ENTRÓ",
  },
  {
    name: "Ana Gómez",
    document: "5067060",
    unit: "Torre 1 - Apto 101",
    time: "09:15 AM",
    status: "SALIDA",
  },
  {
    name: "Luis Torres",
    document: "1123344",
    unit: "Torre 3 - Apto 404",
    time: "10:02 AM",
    status: "ENTRÓ",
  },
  {
    name: "María López",
    document: "9668765",
    unit: "Torre 1 - Apto 201",
    time: "11:20 AM",
    status: "SALIDA",
  },
];

export function DashboardPage() {
  useAuth();

  return (
    <div className="dashboard-view">
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className="metric-card">
            <div className="label">{card.title}</div>
            <div className="value">{card.value}</div>
            <div className="meta">{card.meta}</div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="section-header">
          <h3>Visitas dentro hoy</h3>
          <button type="button" className="inline-button">
            Registrar ingreso
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre del visitante</th>
                <th>Documento de identidad</th>
                <th>Unidad / Apto</th>
                <th>Hora de ingreso</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.document}>
                  <td>{visitor.name}</td>
                  <td>{visitor.document}</td>
                  <td>{visitor.unit}</td>
                  <td>{visitor.time}</td>
                  <td>
                    <span
                      className={`status-badge ${visitor.status === "ENTRÓ" ? "success" : "warning"}`}
                    >
                      {visitor.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="inline-button">
                      Check out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
