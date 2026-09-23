import React, { useEffect, useState } from "react";
import {
  fetchDocumentTypes,
  fetchAssignableRoles,
  fetchResidentialComplexes,
  inviteUser,
  type DocumentType,
  type Role,
  type ResidentialComplex,
  type InviteUserPayload,
} from "../../../services/user-service";
import { CustomSelect, type SelectOption } from "../../../components/ui/Select";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invitedEmail: string) => void;
  currentUserRoleCode: string;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserRoleCode,
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);

  const [formData, setFormData] = useState<InviteUserPayload>({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    organizationId: "",
    residentialComplexId: "",
    documentTypeId: "",
    documentNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isGlobalRole =
    currentUserRoleCode === "ROLE_DEV" ||
    currentUserRoleCode === "ROLE_ORG_ADMIN";

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage(null);
      setError(null);
      return;
    }

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

        if (isGlobalRole) {
          const complexesData = await fetchResidentialComplexes();
          setComplexes(complexesData);
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        setError(message || "Error al cargar los catálogos requeridos.");
      } finally {
        setLoading(false);
      }
    };

    void loadCatalogs();
  }, [isOpen, currentUserRoleCode, isGlobalRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roleId) {
      setError("Debe seleccionar un rol para el usuario.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: InviteUserPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
        ...(formData.documentTypeId && {
          documentTypeId: formData.documentTypeId,
        }),
        ...(formData.documentNumber?.trim() && {
          documentNumber: formData.documentNumber.trim(),
        }),
        ...(formData.residentialComplexId && {
          residentialComplexId: formData.residentialComplexId,
        }),
        ...(formData.organizationId && {
          organizationId: formData.organizationId,
        }),
      };

      await inviteUser(payload);

      const invitedEmail = formData.email.trim();
      setSuccessMessage(`¡Invitación enviada con éxito a ${invitedEmail}!`);

      // Notificar a la vista padre y cerrar el modal tras 1.2 segundos
      setTimeout(() => {
        onSuccess(invitedEmail);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(message || "Ocurrió un error al procesar la invitación.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filtramos la propiedad 'code' del label para mostrar únicamente el nombre amigable
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

  const complexOptions: SelectOption[] = [
    { value: "", label: "Seleccionar conjunto..." },
    ...complexes.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content overflow-visible">
        <h2>Invitar Nuevo Usuario</h2>

        {error && <div className="dashboard-alert">{error}</div>}
        {successMessage && (
          <div className="dashboard-alert success">
            <span>✓</span> {successMessage}
          </div>
        )}

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <span>Cargando opciones del formulario...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                placeholder="Ej: Carlos Pérez"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={submitting || Boolean(successMessage)}
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                placeholder="ejemplo@minutadigital.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={submitting || Boolean(successMessage)}
              />
            </div>

            <div className="form-group">
              <label>Teléfono (Opcional)</label>
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={submitting || Boolean(successMessage)}
              />
            </div>

            <div className="form-group">
              <label>Rol a Asignar *</label>
              <CustomSelect
                options={roleOptions}
                value={formData.roleId}
                onChange={(val) => setFormData({ ...formData, roleId: val })}
                placeholder="Seleccione un rol"
              />
            </div>

            {isGlobalRole && (
              <div className="form-group">
                <label>Conjunto Residencial</label>
                <CustomSelect
                  options={complexOptions}
                  value={formData.residentialComplexId || ""}
                  onChange={(val) =>
                    setFormData({ ...formData, residentialComplexId: val })
                  }
                  placeholder="Seleccione un conjunto"
                />
              </div>
            )}

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
                placeholder="1234567890"
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
                {submitting ? "Enviando..." : "Enviar Invitación"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
