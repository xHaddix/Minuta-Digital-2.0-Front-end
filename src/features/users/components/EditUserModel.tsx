import React, { useEffect, useState } from "react";
import {
  fetchDocumentTypes,
  fetchAssignableRoles,
  updateUser,
} from "../../../services/user-service";
import { CustomSelect, type SelectOption } from "../../../components/ui/Select";
import { CheckIcon } from "../../../components/icons/CheckIcon";
import type {
  DocumentType,
  Role,
  UpdateUserPayload,
  User,
} from "../../../types/user";

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: "",
    phone: "",
    roleId: "",
    documentTypeId: "",
    documentNumber: "",
    status: 1,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) {
      setSuccessMessage(null);
      setError(null);
      return;
    }

    // Precargar datos del usuario seleccionado
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      roleId: user.role?.id || "",
      documentTypeId: user.documentType?.id || "",
      documentNumber: user.documentNumber || "",
      status: user.status,
    });

    const loadCatalogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docsData, rolesData] = await Promise.all([
          fetchDocumentTypes(),
          fetchAssignableRoles(),
        ]);
        setDocumentTypes(docsData);
        setRoles(rolesData);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        setError(message || "Error al cargar los catálogos del formulario.");
      } finally {
        setLoading(false);
      }
    };

    void loadCatalogs();
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: UpdateUserPayload = {
        name: formData.name?.trim(),
        phone: formData.phone?.trim() || undefined,
        roleId: formData.roleId || undefined,
        documentTypeId: formData.documentTypeId || undefined,
        documentNumber: formData.documentNumber?.trim() || undefined,
        status: Number(formData.status),
      };

      await updateUser(user.id, payload);

      setSuccessMessage("¡Usuario actualizado correctamente!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(message || "Ocurrió un error al actualizar el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  const roleOptions: SelectOption[] = roles.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const docTypeOptions: SelectOption[] = [
    { value: "", label: "Sin especificar" },
    ...documentTypes.map((d) => ({
      value: d.id,
      label: `${d.code} - ${d.description || ""}`,
    })),
  ];

  const statusOptions: SelectOption[] = [
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
    ...(user.status === 2
      ? [{ value: "2", label: "Pendiente de Activación" }]
      : []),
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content overflow-visible">
        <h2>Editar Usuario</h2>

        {error && <div className="dashboard-alert">{error}</div>}
        {successMessage && (
          <div className="dashboard-alert success">
            <CheckIcon /> {successMessage}
          </div>
        )}

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <span>Cargando datos del usuario...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Correo Electrónico (No editable)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={submitting || Boolean(successMessage)}
              />
            </div>

            <div className="form-group">
              <label>Teléfono (Opcional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={submitting || Boolean(successMessage)}
              />
            </div>

            <div className="form-group">
              <label>Rol Asignado *</label>
              <CustomSelect
                options={roleOptions}
                value={formData.roleId || ""}
                onChange={(val) => setFormData({ ...formData, roleId: val })}
                placeholder="Seleccione un rol"
              />
            </div>

            <div className="form-group">
              <label>Estado del Usuario *</label>
              <CustomSelect
                options={statusOptions}
                value={String(formData.status)}
                onChange={(val) =>
                  setFormData({ ...formData, status: Number(val) })
                }
                placeholder="Seleccione el estado"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Documento (Opcional)</label>
              <CustomSelect
                options={docTypeOptions}
                value={formData.documentTypeId || ""}
                onChange={(val) =>
                  setFormData({ ...formData, documentTypeId: val })
                }
                placeholder="Seleccione tipo de documento"
              />
            </div>

            <div className="form-group">
              <label>Número de Documento (Opcional)</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) =>
                  setFormData({ ...formData, documentNumber: e.target.value })
                }
                disabled={submitting || Boolean(successMessage)}
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
                onClick={onClose}
                disabled={submitting || Boolean(successMessage)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-button"
                disabled={submitting || Boolean(successMessage)}
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
