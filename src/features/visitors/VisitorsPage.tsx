import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { LogOut, Plus } from "lucide-react";
import {
  fetchVisitors,
  markVisitorExit,
  registerVisitorEntry,
} from "../../services/visitor-service";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import { fetchApartments } from "../../services/apartment-service";
import { VISITOR_UPDATED_EVENT } from "../../notifications/useNotifications";
import type {
  RegisterVisitorEntryPayload,
  VisitorListItem,
} from "../../types/visitor";

const emptyForm: RegisterVisitorEntryPayload = {
  fullName: "",
  documentNumber: "",
  documentType: "",
  unitTarget: "",
};

const documentTypeOptions: SelectOption[] = [
  { value: "", label: "Sin especificar" },
  { value: "CC", label: "CC - Cédula de ciudadanía" },
  { value: "CE", label: "CE - Cédula de extranjería" },
  { value: "PASSPORT", label: "Pasaporte" },
];

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitingVisitorId, setExitingVisitorId] = useState<string | null>(null);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

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

  useEffect(() => {
    if (!isEntryModalOpen) return;

    const loadUnits = async () => {
      setIsLoadingUnits(true);
      try {
        const apartments = await fetchApartments();
        const units = apartments
          .map((apartment) => ({
            value: apartment.unitNumber,
            label:
              [
                apartment.tower ? `Torre ${apartment.tower}` : "",
                apartment.apartmentNumber
                  ? `Apto ${apartment.apartmentNumber}`
                  : "",
              ]
                .filter(Boolean)
                .join(" · ") || apartment.unitNumber,
          }))
          .filter((apartment) => apartment.value)
          .filter(
            (apartment, index, all) =>
              all.findIndex((item) => item.value === apartment.value) === index,
          )
          .sort((first, second) =>
            first.label.localeCompare(second.label, undefined, {
              numeric: true,
            }),
          );
        setUnitOptions([
          { value: "", label: "Seleccionar apartamento..." },
          ...units,
        ]);
      } catch {
        setUnitOptions([
          { value: "", label: "No hay apartamentos disponibles" },
        ]);
      } finally {
        setIsLoadingUnits(false);
      }
    };

    void loadUnits();
  }, [isEntryModalOpen]);

  useEffect(() => {
    const handleVisitorUpdate = (event: Event) => {
      const visitor = (event as CustomEvent<VisitorListItem>).detail;
      if (!visitor?.id) return;

      setVisitors((current) => [
        visitor,
        ...current.filter((item) => item.id !== visitor.id),
      ]);
    };

    window.addEventListener(VISITOR_UPDATED_EVENT, handleVisitorUpdate);
    return () =>
      window.removeEventListener(VISITOR_UPDATED_EVENT, handleVisitorUpdate);
  }, []);

  const handleRegisterEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const visitor = await registerVisitorEntry({
        fullName: formData.fullName.trim(),
        documentNumber: formData.documentNumber?.trim() || undefined,
        documentType: formData.documentType?.trim() || undefined,
        unitTarget: formData.unitTarget?.trim() || undefined,
      });
      setVisitors((current) => [
        visitor,
        ...current.filter((item) => item.id !== visitor.id),
      ]);
      setFormData(emptyForm);
      setIsEntryModalOpen(false);
    } catch {
      setError("No fue posible registrar el ingreso del visitante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = async (visitorId: string) => {
    setExitingVisitorId(visitorId);
    setError("");

    try {
      const visitor = await markVisitorExit(visitorId);
      setVisitors((current) => [
        visitor,
        ...current.filter((item) => item.id !== visitor.id),
      ]);
    } catch {
      setError("No fue posible registrar la salida del visitante.");
    } finally {
      setExitingVisitorId(null);
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
        <div
          className="section-header"
          style={{
            padding: 0,
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Gestión de Visitantes
          </h2>
          <button
            type="button"
            className="inline-button users-primary-button"
            onClick={() => setIsEntryModalOpen(true)}
          >
            <Plus size={16} className="mr-2 inline" />
            Registrar ingreso
          </button>
        </div>

        {error ? (
          <div className="dashboard-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        ) : null}

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
              <tr>
                <th style={{ padding: "0.75rem 1rem" }}>
                  VISITANTE / DOCUMENTO
                </th>
                <th style={{ padding: "0.75rem 1rem" }}>UNIDAD</th>
                <th style={{ padding: "0.75rem 1rem" }}>INGRESO</th>
                <th style={{ padding: "0.75rem 1rem" }}>SALIDA</th>
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
                    className="px-4 py-6 text-center text-slate-500"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    Cargando visitantes...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    No hay registros de visitantes para este conjunto.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#fff",
                          fontSize: "0.95rem",
                        }}
                      >
                        {visitor.fullName}
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.85rem",
                          marginTop: "0.15rem",
                        }}
                      >
                        {visitor.documentType || "Documento"}
                        {visitor.documentNumber
                          ? ` - ${visitor.documentNumber}`
                          : ""}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {visitor.unitTarget ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {formatDate(visitor.entryTime)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#e2e8f0",
                        fontSize: "0.9rem",
                      }}
                    >
                      {formatDate(visitor.exitTime)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <span
                        className={`status-badge ${visitor.status === "active" ? "success" : "warning"}`}
                        style={{
                          borderRadius: "9999px",
                          padding: "0.2rem 0.6rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {visitor.status === "active" ? "ACTIVO" : "FINALIZADO"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {visitor.status === "active" ? (
                        <button
                          type="button"
                          className="inline-button"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                          onClick={() => void handleExit(visitor.id)}
                          disabled={exitingVisitorId === visitor.id}
                        >
                          <LogOut size={13} />
                          {exitingVisitorId === visitor.id
                            ? "Guardando..."
                            : "Registrar salida"}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEntryModalOpen ? (
        <div className="modal-backdrop">
          <div className="modal-content overflow-visible">
            <h2>Registrar Nuevo Visitante</h2>

            {error && <div className="dashboard-alert">{error}</div>}

            <form onSubmit={handleRegisterEntry} className="modal-form">
              <div className="form-group">
                <label htmlFor="visitor-full-name">Nombre completo *</label>
                <input
                  id="visitor-full-name"
                  value={formData.fullName}
                  onChange={(event) =>
                    setFormData({ ...formData, fullName: event.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>
              <div className="form-group">
                <label htmlFor="visitor-document-type">
                  Tipo de documento (Opcional)
                </label>
                <CustomSelect
                  options={documentTypeOptions}
                  value={formData.documentType ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, documentType: value })
                  }
                  placeholder="Seleccione tipo de documento"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="visitor-document-number">
                  Número de documento
                </label>
                <input
                  id="visitor-document-number"
                  value={formData.documentNumber}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      documentNumber: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="visitor-unit-target">
                  Unidad o apartamento
                </label>
                <CustomSelect
                  options={unitOptions}
                  value={formData.unitTarget ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, unitTarget: value })
                  }
                  placeholder={
                    isLoadingUnits
                      ? "Cargando apartamentos..."
                      : "Seleccionar apartamento..."
                  }
                  disabled={
                    isSubmitting || isLoadingUnits || unitOptions.length <= 1
                  }
                />
              </div>
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
                  className="secondary-button"
                  onClick={() => setIsEntryModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrar Visitante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
