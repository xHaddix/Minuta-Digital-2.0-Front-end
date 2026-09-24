import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  DocumentType,
  InviteUserPayload,
  InviteUserResponse,
  ResidentialComplex,
  Role,
  UpdateUserPayload,
  User,
} from "../types/user";

/**
 * Obtiene los usuarios dentro del alcance del solicitante.
 * El filtrado multi-tenant (scopeWhereClause) es aplicado de forma
 * estricta por el backend en PostgreSQL a través del token JWT.
 */
export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>(AUTH_ENDPOINTS.users);
  return response.data;
};

/**
 * Obtiene el catálogo de tipos de documento activos (CC, CE, NIT, etc.).
 */
export const fetchDocumentTypes = async (): Promise<DocumentType[]> => {
  const response = await api.get<DocumentType[]>("/document-types");
  return response.data;
};

/**
 * Obtiene los roles que el usuario autenticado tiene permitido asignar
 * según la matriz de jerarquía RBAC validada en backend.
 */
export const fetchAssignableRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>("/roles/assignable");
  return response.data;
};

/**
 * Obtiene los conjuntos residenciales acotados según el alcance del usuario.
 * Soporta filtrado opcional por organizationId para el rol ROLE_DEV.
 */
export const fetchResidentialComplexes = async (
  organizationId?: string,
): Promise<ResidentialComplex[]> => {
  const params = organizationId ? { organizationId } : {};
  const response = await api.get<ResidentialComplex[]>(
    "/residential-complexes",
    { params },
  );
  return response.data;
};

/**
 * Envía la invitación de un nuevo usuario al sistema.
 */
export const inviteUser = async (
  payload: InviteUserPayload,
): Promise<InviteUserResponse> => {
  const response = await api.post<InviteUserResponse>("/users/invite", payload);
  return response.data;
};

/**
 * Actualiza la información parcial de un usuario en el backend.
 */
export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  const response = await api.patch<User>(`/users/${id}`, payload);
  return response.data;
};

/**
 * Elimina (Hard Delete si es PENDING) o desactiva (Soft Delete si es ACTIVO) un usuario.
 */
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/users/${id}`);
  return response.data;
};
