import { useEffect, useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { AvatarImage } from "./AvatarImage";

interface ImageUploadFieldProps {
  name: string;
  initialUrl?: string | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}

export function ImageUploadField({
  name,
  initialUrl,
  disabled = false,
  onChange,
}: ImageUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!selectedFile) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(selectedFile.type)) {
      setFile(null);
      onChange(null);
      setError("Selecciona una imagen PNG, JPG o WebP.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      onChange(null);
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    setError(null);
    setFile(selectedFile);
    onChange(selectedFile);
  };

  return (
    <div className="image-upload-field">
      <AvatarImage src={previewUrl ?? initialUrl} name={name} size={72} />
      <div className="image-upload-copy">
        <strong>Foto de perfil</strong>
        <span>PNG, JPG o WebP · máximo 5 MB</span>
        {file ? <span className="image-upload-filename">{file.name}</span> : null}
        {error ? <span className="image-upload-error" role="alert">{error}</span> : null}
        <label className={`image-upload-button${disabled ? " is-disabled" : ""}`}>
          <ImagePlus size={15} />
          <span>{file ? "Cambiar imagen" : "Elegir imagen"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label={`Elegir foto de ${name}`}
            onChange={handleChange}
            disabled={disabled}
            hidden
          />
        </label>
      </div>
    </div>
  );
}
