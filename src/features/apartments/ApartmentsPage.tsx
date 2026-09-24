import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Edit2,
  Plus,
  RotateCcw,
  Trash2,
  UsersRound,
  UserRoundPlus,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import {
  createApartment,
  deactivateApartment,
  fetchApartments,
  updateApartment,
} from "../../services/apartment-service";
import {
  assignResidentApartment,
  createResidentForApartment,
  fetchResidents,
  unassignResidentApartment,
} from "../../services/resident-service";
import { fetchUsers } from "../../services/user-service";
import type {
  ApartmentListItem,
  ApartmentPayload,
} from "../../types/apartment";
import type { ResidentListItem } from "../../types/resident";
import type { User } from "../../types/user";
import { useAuth } from "../../auth/useAuth";

const emptyForm: ApartmentPayload = {
  tower: "",
  apartmentNumber: "",
  unitType: "APARTMENT",
};

const apartmentTypeOptions: SelectOption[] = [
  { value: "APARTMENT", label: "Apartamento" },
  { value: "HOUSE", label: "Casa" },
  { value: "COMMERCIAL", label: "Local comercial" },
];

export function ApartmentsPage() {
  const { session } = useAuth();
  const [apartments, setApartments] = useState<ApartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] =
    useState<ApartmentListItem | null>(null);
  const [formData, setFormData] = useState<ApartmentPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [assignmentApartment, setAssignmentApartment] =
    useState<ApartmentListItem | null>(null);
  const [managingResidentsApartment, setManagingResidentsApartment] =
    useState<ApartmentListItem | null>(null);
  const [removingResidentId, setRemovingResidentId] = useState<string | null>(
    null,
  );
  const [residentActionError, setResidentActionError] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const scopedResidents = useMemo(() => {
    const activeComplexId = session?.residentialComplexId;
    if (!activeComplexId) return [];

    const activeApartmentIds = new Set(
      apartments.map((apartment) => apartment.id),
    );

    return residents.filter((resident) => {
      const residentComplexId =
        resident.residentialComplexId ?? resident.complexId;
      if (residentComplexId) return residentComplexId === activeComplexId;
      if (resident.apartmentId) {
        return activeApartmentIds.has(resident.apartmentId);
      }

      // The API scopes residents by the active JWT. Older payloads omit both
      // complexId and apartmentId, so keep those records from that scoped API.
      return true;
    });
  }, [apartments, residents, session?.residentialComplexId]);

  const assignableResidents = useMemo(() => {
    const activeComplexId = session?.residentialComplexId;
    if (!activeComplexId) return [];

    return users
      .filter(
        (user) =>
          user.role?.code === "ROLE_RESIDENT" && user.status !== 0,
      )
      .map((user) => ({
        user,
        resident: scopedResidents.find(
          (resident) => resident.user?.id === user.id,
        ),
      }))
      .filter(
        ({ user, resident }) =>
          user.residentialComplexId === activeComplexId || Boolean(resident),
      )
      .sort((first, second) => first.user.name.localeCompare(second.user.name));
  }, [scopedResidents, session?.residentialComplexId, users]);

  const loadApartments = async () => {
    setLoading(true);
    setError("");
    try {
      setApartments(await fetchApartments(true));
    } catch {
      setError("No fue posible cargar las unidades del conjunto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setApartments([]);
    setResidents([]);
    setUsers([]);
    setLoadingResidents(true);
    setAssignmentApartment(null);
    setManagingResidentsApartment(null);
    setSelectedResidentId("");
    void loadApartments();
    void Promise.all([fetchResidents(), fetchUsers()])
      .then(([nextResidents, nextUsers]) => {
        setResidents(nextResidents);
        setUsers(nextUsers);
      })
      .catch(() => {
        setResidents([]);
        setUsers([]);
      })
      .finally(() => setLoadingResidents(false));
  }, [session?.residentialComplexId]);

  const filteredApartments = useMemo(() => {
    if (statusFilter === "ACTIVE") {
      return apartments.filter((apartment) => apartment.status === 1);
    }
    if (statusFilter === "AVAILABLE") {
      return apartments.filter((apartment) => apartment.available);
    }
    if (statusFilter === "OCCUPIED") {
      return apartments.filter(
        (apartment) => apartment.status === 1 && !apartment.available,
      );
    }
    if (statusFilter === "INACTIVE") {
      return apartments.filter((apartment) => apartment.status === 0);
    }
    return apartments;
  }, [apartments, statusFilter]);

  const getApartmentResidents = (apartment: ApartmentListItem) =>
    scopedResidents.filter(
      (resident) =>
        resident.apartmentId === apartment.id ||
        (!resident.apartmentId && resident.unitNumber === apartment.unitNumber),
    );

  const openCreateModal = () => {
    setEditingApartment(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (apartment: ApartmentListItem) => {
    setEditingApartment(apartment);
    setFormData({
      tower: apartment.tower ?? "",
      apartmentNumber: apartment.apartmentNumber ?? "",
      unitNumber: apartment.unitNumber,
      unitType: apartment.unitType ?? "APARTMENT",
    });
    setIsModalOpen(true);
  };

  const openAssignmentModal = (apartment: ApartmentListItem) => {
    setAssignmentApartment(apartment);
    setSelectedResidentId("");
  };

  const handleUnassignResident = async (residentId: string) => {
    if (!managingResidentsApartment) return;

    setRemovingResidentId(residentId);
    setResidentActionError("");
    try {
      await unassignResidentApartment(residentId);
      const [nextApartments, nextResidents, nextUsers] = await Promise.all([
        fetchApartments(true),
        fetchResidents(),
        fetchUsers(),
      ]);
      setApartments(nextApartments);
      setResidents(nextResidents);
      setUsers(nextUsers);
    } catch {
      setResidentActionError(
        "No fue posible quitar al residente de esta unidad.",
      );
    } finally {
      setRemovingResidentId(null);
    }
  };

  const handleAssignResident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignmentApartment || !selectedResidentId) return;

    setAssigning(true);
    setError("");
    try {
      const selectedResident = assignableResidents.find(
        ({ user }) => user.id === selectedResidentId,
      );
      if (!selectedResident) {
        throw new Error("El residente ya no está disponible en este conjunto");
      }

      if (selectedResident.resident) {
        await assignResidentApartment(
          selectedResident.resident.id,
          assignmentApartment.id,
        );
      } else {
        await createResidentForApartment(
          selectedResident.user.id,
          assignmentApartment.id,
        );
      }

      setAssignmentApartment(null);
      setSelectedResidentId("");
      await loadApartments();
      const [nextResidents, nextUsers] = await Promise.all([
        fetchResidents(),
        fetchUsers(),
      ]);
      setResidents(nextResidents);
      setUsers(nextUsers);
    } catch {
      setError("No fue posible asignar el residente al apartamento.");
    } finally {
      setAssigning(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      tower: formData.tower?.trim() || undefined,
      apartmentNumber: formData.apartmentNumber?.trim() || undefined,
      unitType: formData.unitType?.trim() || "APARTMENT",
    };

    try {
      const apartment = editingApartment
        ? await updateApartment(editingApartment.id, payload)
        : await createApartment(payload);
      setApartments((current) => {
        const next = current.filter((item) => item.id !== apartment.id);
        return [...next, apartment].sort((first, second) =>
          first.unitNumber.localeCompare(second.unitNumber, undefined, {
            numeric: true,
          }),
        );
      });
      setIsModalOpen(false);
    } catch {
      setError(
        "No fue posible guardar el apartamento. Verifica que no esté duplicado.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (apartment: ApartmentListItem) => {
    const nextStatus = apartment.status === 1 ? 0 : 1;
    const action = nextStatus === 1 ? "activar" : "desactivar";
    if (!window.confirm(`¿Deseas ${action} ${apartment.unitNumber}?`)) return;

    try {
      if (nextStatus === 0) {
        await deactivateApartment(apartment.id);
      } else {
        await updateApartment(apartment.id, { status: 1 });
      }
      setApartments((current) =>
        current.map((item) =>
          item.id === apartment.id
            ? {
                ...item,
                status: nextStatus,
                available: nextStatus === 1 && (item.residentCount ?? 0) === 0,
              }
            : item,
        ),
      );
    } catch {
      setError("No fue posible desactivar el apartamento.");
    }
  };

  return (
    <div className="dashboard-view apartments-page">
      <div
        className="table-card apartments-table-card"
        style={{ padding: "1.25rem" }}
      >
        <div
          className="section-header"
          style={{ padding: 0, marginBottom: "1.5rem" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Building2 size={22} color="#9bb6ff" />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                Gestión de Apartamentos
              </h2>
              <span className="apartments-subtitle">
                Catálogo de unidades del conjunto actual
              </span>
            </div>
          </div>
          <button
            type="button"
            className="inline-button users-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Crear apartamento
          </button>
        </div>

        <div className="apartments-summary">
          <span className="apartments-summary-dot" />
          <strong>
            {apartments.filter((item) => item.status === 1).length}
          </strong>
          <span>
            activas · {apartments.filter((item) => item.available).length}{" "}
            disponibles
          </span>
        </div>

        <div className="apartments-filter-row">
          <CustomSelect
            options={[
              { value: "ALL", label: "Todas las unidades" },
              { value: "AVAILABLE", label: "Disponibles" },
              { value: "OCCUPIED", label: "Ocupadas" },
              { value: "INACTIVE", label: "Inactivas" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <span>{filteredApartments.length} mostradas</span>
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
                <th style={{ padding: "0.75rem 1rem" }}>UNIDAD / ETIQUETA</th>
                <th style={{ padding: "0.75rem 1rem" }}>TORRE</th>
                <th style={{ padding: "0.75rem 1rem" }}>APARTAMENTO</th>
                <th style={{ padding: "0.75rem 1rem" }}>TIPO</th>
                <th style={{ padding: "0.75rem 1rem" }}>RESIDENTES</th>
                <th style={{ padding: "0.75rem 1rem" }}>DISPONIBILIDAD</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    Cargando apartamentos...
                  </td>
                </tr>
              ) : filteredApartments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#94a3b8",
                    }}
                  >
                    No hay apartamentos creados para este conjunto.
                  </td>
                </tr>
              ) : (
                filteredApartments.map((apartment) => {
                  const apartmentResidents = getApartmentResidents(apartment);
                  const visibleResidents = apartmentResidents.slice(0, 2);
                  const extraResidentsCount =
                    apartmentResidents.length - visibleResidents.length;

                  return (
                    <tr
                      key={apartment.id}
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      <div>{apartment.unitNumber}</div>
                      <small className="apartments-cell-muted">
                        Unidad habitacional
                      </small>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#e2e8f0" }}>
                      {apartment.tower || "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#e2e8f0" }}>
                      {apartment.apartmentNumber || "-"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span className="apartments-type-badge">
                        {apartment.unitType || "APARTMENT"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {apartmentResidents.length === 0 ? (
                        <span className="apartments-cell-muted">Sin asignar</span>
                      ) : (
                        <div className="apartments-residents-list">
                          {visibleResidents.map((resident) => (
                            <span
                              className="apartment-resident-chip"
                              key={resident.id}
                              title={resident.user?.email}
                            >
                              {resident.user?.name ?? "Residente"}
                            </span>
                          ))}
                          {extraResidentsCount > 0 ? (
                            <button
                              type="button"
                              className="apartment-resident-more"
                              onClick={() =>
                                setManagingResidentsApartment(apartment)
                              }
                              title={`Ver los ${apartmentResidents.length} residentes`}
                            >
                              +{extraResidentsCount}
                            </button>
                          ) : null}
                          {apartmentResidents.length <= 2 ? (
                            <button
                              type="button"
                              className="apartment-resident-manage"
                              onClick={() =>
                                setManagingResidentsApartment(apartment)
                              }
                              aria-label={`Administrar residentes de ${apartment.unitNumber}`}
                              title="Ver residentes"
                            >
                              <UsersRound size={14} />
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        className={`apartments-status-badge ${apartment.status === 0 ? "inactive" : apartment.available ? "available" : "occupied"}`}
                      >
                        {apartment.status === 0
                          ? "INACTIVA"
                          : apartment.available
                            ? "DISPONIBLE"
                            : `OCUPADA · ${apartment.residentCount ?? 0}`}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          type="button"
                          className="inline-button apartments-icon-button"
                          title="Asignar residente"
                          onClick={() => openAssignmentModal(apartment)}
                          disabled={apartment.status === 0}
                          style={{
                            color: "#9bb6ff",
                          }}
                        >
                          <UserRoundPlus size={15} />
                        </button>
                        <button
                          type="button"
                          className="inline-button apartments-icon-button"
                          title="Editar apartamento"
                          onClick={() => openEditModal(apartment)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="inline-button apartments-icon-button"
                          title="Desactivar apartamento"
                          onClick={() => void handleToggleStatus(apartment)}
                          style={{
                            color:
                              apartment.status === 1 ? "#ef4444" : "#62d6a5",
                            borderColor:
                              apartment.status === 1
                                ? "rgba(239,68,68,0.3)"
                                : "rgba(98,214,165,0.3)",
                          }}
                        >
                          {apartment.status === 1 ? (
                            <Trash2 size={15} />
                          ) : (
                            <RotateCcw size={15} />
                          )}
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

      {isModalOpen ? (
        <div className="modal-backdrop">
          <div className="modal-content overflow-visible">
            <h2>
              {editingApartment
                ? "Editar Apartamento"
                : "Crear Nuevo Apartamento"}
            </h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="apartment-tower">Torre</label>
                <input
                  id="apartment-tower"
                  value={formData.tower}
                  onChange={(event) =>
                    setFormData({ ...formData, tower: event.target.value })
                  }
                  placeholder="Ej. 2"
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="apartment-number">
                  Número de apartamento *
                </label>
                <input
                  id="apartment-number"
                  value={formData.apartmentNumber}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      apartmentNumber: event.target.value,
                    })
                  }
                  placeholder="Ej. 504"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="apartment-type">Tipo de unidad</label>
                <CustomSelect
                  options={apartmentTypeOptions}
                  value={formData.unitType ?? "APARTMENT"}
                  onChange={(value) =>
                    setFormData({ ...formData, unitType: value })
                  }
                  disabled={submitting}
                  placeholder="Seleccione tipo de unidad"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-button"
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : "Guardar apartamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {assignmentApartment ? (
        <div className="modal-backdrop">
          <div className="modal-content overflow-visible">
            <h2>Asignar residente</h2>
            <p className="apartments-modal-context">
              Unidad seleccionada:{" "}
              <strong>{assignmentApartment.unitNumber}</strong>
            </p>
            <form onSubmit={handleAssignResident} className="modal-form">
              <div className="form-group">
                <label>Residente</label>
                <CustomSelect
                  options={assignableResidents.map(({ user }) => ({
                    value: user.id,
                    label: `${user.name} · ${user.email}`,
                  }))}
                  value={selectedResidentId}
                  onChange={setSelectedResidentId}
                  placeholder={
                    loadingResidents
                      ? "Cargando residentes..."
                      : "Seleccione un residente"
                  }
                  searchable
                  searchPlaceholder="Buscar residente..."
                  disabled={
                    assigning ||
                    loadingResidents ||
                    assignableResidents.length === 0
                  }
                />
                {!loadingResidents && assignableResidents.length === 0 ? (
                  <small className="apartments-cell-muted">
                    No hay usuarios con rol residente asociados al conjunto activo.
                  </small>
                ) : null}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAssignmentApartment(null)}
                  disabled={assigning}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-button"
                  disabled={
                    assigning || loadingResidents || !selectedResidentId
                  }
                >
                  {assigning ? "Asignando..." : "Asignar residente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {managingResidentsApartment ? (
        <div className="modal-backdrop">
          <div className="modal-content apartment-residents-modal">
            <h2>Residentes asignados</h2>
            <p className="apartments-modal-context">
              Unidad: <strong>{managingResidentsApartment.unitNumber}</strong>
            </p>
            <ul className="apartment-resident-list">
              {getApartmentResidents(managingResidentsApartment).map(
                (resident) => (
                  <li key={resident.id}>
                    <div>
                      <strong>{resident.user?.name ?? "Residente"}</strong>
                      {resident.user?.email ? (
                        <small>{resident.user.email}</small>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="secondary-button apartment-resident-remove"
                      onClick={() => void handleUnassignResident(resident.id)}
                      disabled={removingResidentId === resident.id}
                      title="Quitar residente de esta unidad"
                    >
                      {removingResidentId === resident.id
                        ? "Quitando..."
                        : "Quitar"}
                    </button>
                  </li>
                ),
              )}
            </ul>
            {residentActionError ? (
              <p className="apartment-resident-api-note apartment-resident-error">
                {residentActionError}
              </p>
            ) : null}
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setManagingResidentsApartment(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="inline-button"
                onClick={() => {
                  const apartment = managingResidentsApartment;
                  setManagingResidentsApartment(null);
                  openAssignmentModal(apartment);
                }}
              >
                Asignar otro residente
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
