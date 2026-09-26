import type { UpdateUserPayload } from "../../../types/user";

export interface EditUserFormValues {
  name?: string;
  phone?: string;
  roleId?: string;
  documentTypeId?: string;
  documentNumber?: string;
  status?: number;
}

/** Builds the PATCH body. Tenant scope is derived by the backend from the user's residential complex. */
export const buildUpdateUserPayload = (
  form: EditUserFormValues,
): UpdateUserPayload => ({
  name: form.name?.trim(),
  phone: form.phone?.trim() || undefined,
  roleId: form.roleId || undefined,
  documentTypeId: form.documentTypeId || undefined,
  documentNumber: form.documentNumber?.trim() || undefined,
  status: Number(form.status),
});
