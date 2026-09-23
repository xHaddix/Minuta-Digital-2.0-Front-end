import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { UserListItem, VisitorListItem } from "../types/auth";

// Tipos para los catálogos y la invitación
export interface DocumentType {
  id: string;
  code: string;
  description: string | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface ResidentialComplex {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
}

export interface InviteUserPayload {
  email: string;
  name: string;
  phone?: string;
  roleId: string;
  organizationId?: string;
  residentialComplexId?: string;
  documentTypeId?: string;
  documentNumber?: string;
}

export interface InviteUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    status: number;
  };
}

/**
  Obtiene los usuarios dentro del alcance del solicitante.
  El filtrado multi-tenant (scopeWhereClause) es aplicado de forma
  estricta por el backend en PostgreSQL a través del token JWT.
 */
export const fetchUsers = async (): Promise<UserListItem[]> => {
  const response = await api.get<UserListItem[]>(AUTH_ENDPOINTS.users);
  return response.data;
};

/**
  Obtiene el catálogo de tipos de documento activos (CC, CE, NIT, etc.).
 */
export const fetchDocumentTypes = async (): Promise<DocumentType[]> => {
  const response = await api.get<DocumentType[]>("/document-types");
  return response.data;
};

/**
  Obtiene los roles que el usuario autenticado tiene permitido asignar
  según la matriz de jerarquía RBAC validada en backend.
 */
export const fetchAssignableRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>("/roles/assignable");
  return response.data;
};

/**
  Obtiene los conjuntos residenciales acotados según el alcance del usuario.
  Soporta filtrado opcional por organizationId para el rol ROLE_DEV.
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
  Envía la invitación de un nuevo usuario al sistema.
 */
export const inviteUser = async (
  payload: InviteUserPayload,
): Promise<InviteUserResponse> => {
  const response = await api.post<InviteUserResponse>("/users/invite", payload);
  return response.data;
};

export const fetchVisitors = async () => {
  const response = await api.get<VisitorListItem[]>(AUTH_ENDPOINTS.visitors);
  return response.data;
};

export const markVisitorExit = async (visitorId: string) => {
  const response = await api.patch<VisitorListItem>(
    `${AUTH_ENDPOINTS.visitors}/${visitorId}/exit`,
  );
  return response.data;
};
