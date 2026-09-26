import { useEffect, useState, type ChangeEvent } from "react";
import { Building2, ImagePlus } from "lucide-react";
import { validateImageFile } from "../../services/storage-service";

export function LogoFilePicker({ file, onChange, disabled = false }: { file: File | null; onChange: (file: File | null) => void; disabled?: boolean }) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!selected) return;
    try { validateImageFile(selected); onChange(selected); setError(""); }
    catch (err) { onChange(null); setError(err instanceof Error ? err.message : "Imagen no válida."); }
  };
  return <div className="entity-logo-picker">
    <span className="entity-logo-preview">{preview ? <img src={preview} alt="Vista previa del logo"/> : <Building2 size={24}/>}</span>
    <span className="entity-logo-copy"><strong>Logo (opcional)</strong><small>PNG, JPG o WebP · máximo 5 MB</small>
      <label className={`entity-file-button${disabled ? " is-disabled" : ""}`}><ImagePlus size={15}/>{file?.name ?? "Elegir imagen"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={change} hidden/></label>
      {error && <small className="entity-form-error">{error}</small>}
    </span>
  </div>;
}
