import api from "./api";

export type StorageModule =
  | "correspondence"
  | "pqrs"
  | "marketplace"
  | "amenities"
  | "visitors"
  | "general";

export interface StorageUploadResult {
  key: string;
  bucket: string;
  url: string;
}

const uploadMultipart = async <T>(path: string, file: File, fields?: Record<string, string>) => {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(fields ?? {}).forEach(([key, value]) => formData.append(key, value));

  const response = await api.post<T>(path, formData, {
    // Axios removes this explicit type in the browser and adds the multipart boundary.
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
  return response.data;
};

export const uploadFile = (file: File, module: StorageModule) =>
  uploadMultipart<StorageUploadResult>("/storage/upload", file, { module });

export const uploadOrganizationLogo = (organizationId: string, file: File) =>
  uploadMultipart<{ id: string; urlLogo: string }>(
    `/organizations/${organizationId}/logo`,
    file,
  );

export const uploadComplexLogo = (complexId: string, file: File) =>
  uploadMultipart<{ id: string; urlLogo: string }>(
    `/residential-complexes/${complexId}/logo`,
    file,
  );

export const uploadUserAvatar = (userId: string, file: File) =>
  uploadMultipart<{ id: string; imgProfile: string | null }>(
    `/users/${userId}/avatar`,
    file,
  );

export const uploadOwnUserAvatar = (file: File) =>
  uploadMultipart<{ id: string; imgProfile: string | null }>(
    "/users/me/avatar",
    file,
  );

export const validateImageFile = (file: File) => {
  const acceptedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!acceptedTypes.includes(file.type)) {
    throw new Error("Selecciona una imagen PNG, JPG o WebP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }
};
