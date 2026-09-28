import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import { ImageUploadField } from "../../components/ui/ImageUploadField";
import { roleLabels } from "../../config/app";
import {
  fetchDocumentTypes,
  fetchOwnProfile,
  updateOwnProfile,
} from "../../services/user-service";
import { uploadOwnUserAvatar } from "../../services/storage-service";
import type { DocumentType, User } from "../../types/user";
import { getApiErrorMessage } from "../../utils/api-error-message.mjs";

interface UserProfileModalProps {
  isOpen: boolean;
  organizationName?: string | null;
  residentialComplexName?: string | null;
  onClose: () => void;
  onSaved: (user: User) => void;
}

export function UserProfileModal({
  isOpen,
  organizationName,
  residentialComplexName,
  onClose,
  onSaved,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsUpdated(false);

    void Promise.all([fetchOwnProfile(), fetchDocumentTypes()])
      .then(([user, types]) => {
        if (cancelled) return;
        setProfile(user);
        setDocumentTypes(types);
        setName(user.name ?? "");
        setPhone(user.phone ?? "");
        setDocumentTypeId(user.documentType?.id ?? "");
        setDocumentNumber(user.documentNumber ?? "");
        setAvatarFile(null);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(loadError, "No se pudo cargar tu perfil."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const documentOptions: SelectOption[] = [
    { value: "", label: "Sin especificar" },
    ...documentTypes.map((type) => ({
      value: type.id,
      label: `${type.code} - ${type.description ?? ""}`,
    })),
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setError(null);
    try {
      const updatedUser = await updateOwnProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        documentTypeId: documentTypeId || null,
        documentNumber: documentNumber.trim() || null,
      });
      setProfile(updatedUser);
      onSaved(updatedUser);
      let finalUser = updatedUser;
      if (avatarFile) {
        const avatar = await uploadOwnUserAvatar(avatarFile);
        finalUser = { ...updatedUser, imgProfile: avatar.imgProfile };
      }
      onSaved(finalUser);
      setIsUpdated(true);
    } catch (saveError: unknown) {
      setError(getApiErrorMessage(saveError, "No se pudo guardar tu perfil."));
    } finally {
      setSubmitting(false);
    }
  };

  const roleCode = profile?.role?.code;
  const isResident = roleCode === "ROLE_RESIDENT";

  return (
    <div className="modal-backdrop profile-modal-backdrop">
      <section
        className="modal-content profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <header className="profile-modal-header">
          <div>
            <p className="profile-modal-eyebrow">Mi cuenta</p>
            <h2 id="profile-modal-title">Mi perfil</h2>
          </div>
          <button
            type="button"
            className="profile-close-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar perfil"
          >
            <X size={19} />
          </button>
        </header>

        {error && <div className="dashboard-alert" role="alert">{error}</div>}
        {loading ? (
          <div className="spinner-container"><div className="spinner" /><span>Cargando perfil...</span></div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            {!isResident && (
              <div className="profile-summary-grid">
                  <div><span>Rol</span><strong>{roleCode ? roleLabels[roleCode] ?? roleCode : "—"}</strong></div>
                  <div><span>Organización</span><strong>{organizationName || "—"}</strong></div>
                  <div><span>Conjunto residencial</span><strong>{residentialComplexName || "—"}</strong></div>
              </div>
            )}

            <ImageUploadField
              name={name || profile?.name || "Usuario"}
              initialUrl={profile?.imgProfile}
              onChange={setAvatarFile}
              disabled={submitting}
            />

            <div className="form-group">
              <label htmlFor="profile-email">Correo electrónico</label>
              <input id="profile-email" type="email" value={profile?.email ?? ""} disabled />
              <small className="profile-field-hint">El correo de acceso no se puede cambiar desde el perfil.</small>
            </div>
            <div className="form-group">
              <label htmlFor="profile-name">Nombre completo *</label>
              <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} disabled={submitting} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-phone">Teléfono</label>
              <input id="profile-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Número de contacto" disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Tipo de documento</label>
              <CustomSelect options={documentOptions} value={documentTypeId} onChange={setDocumentTypeId} placeholder="Seleccione tipo de documento" disabled={submitting} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-document-number">Número de documento</label>
              <input id="profile-document-number" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} disabled={submitting} />
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button>
              <button type="submit" className="inline-button" disabled={submitting || !profile}>{submitting ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        )}
      </section>
      {isUpdated && (
        <div className="profile-success-backdrop">
          <section
            className="profile-success-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="profile-success-title"
          >
            <CheckCircle2 size={46} strokeWidth={1.8} aria-hidden="true" />
            <h2 id="profile-success-title">¡Actualizado correctamente!</h2>
            <p>Tu información de perfil se guardó correctamente.</p>
            <button type="button" className="inline-button" onClick={onClose}>
              Entendido
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
