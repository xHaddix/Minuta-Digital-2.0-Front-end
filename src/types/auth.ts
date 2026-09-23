// ============================================================================
// Minuta Digital - Frontend Type Definitions
// ============================================================================

// 1. CÓDIGOS DOMINIO Y RBAC
export type RoleCode =
  | "ROLE_DEV"
  | "ROLE_ORG_ADMIN"
  | "ROLE_COMPLEX_ADMIN"
  | "ROLE_SECURITY"
  | "ROLE_RESIDENT";

export type PermissionCode =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "visitors:read"
  | "visitors:create"
  | "visitors:authorize"
  | "visitors:check_out"
  | "correspondence:read"
  | "correspondence:read_own"
  | "correspondence:create"
  | "correspondence:deliver"
  | "amenities:read"
  | "amenities:manage"
  | "amenities:book"
  | "amenities:approve"
  | "amenities:verify"
  | "pqrs:read_own"
  | "pqrs:read_all"
  | "pqrs:create"
  | "pqrs:respond"
  | "pqrs:close"
  | "events:read"
  | "events:create"
  | "complexes:manage"
  | "organizations:manage";

// 2. CATÁLOGOS AUXILIARES
export interface DocumentTypeInfo {
  id: string;
  code: string;
  description?: string | null;
}

export interface RoleInfo {
  id: string;
  code: RoleCode;
  name: string;
}

// 3. ENTIDADES DE DOMINIO BASE (Single Source of Truth)
export interface Organization {
  id: string;
  name: string;
  slug?: string;
  urlLogo?: string | null;
  logoUrl?: string | null; // Sostener por retrocompatibilidad UI
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResidentialComplex {
  id: string;
  name: string;
  slug?: string;
  organizationId?: string;
  urlLogo?: string | null;
  logoUrl?: string | null; // Sostener por retrocompatibilidad UI
  contactEmail?: string;
  contactPhone?: string | null;
  status?: number | string;
  planCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 4. ENTIDAD USUARIO Y DERIVACIONES DE VISTA
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  roleCode: RoleCode;
  organizationId?: string | null;
  residentialComplexId?: string | null;
}

/// Usado en el estado de sesión de AuthContext
export interface UserSession extends BaseUser {
  roleName?: string;
}

/// Usado en la tabla / listado de usuarios del Dashboard
export interface UserListItem extends BaseUser {
  phone?: string | null;
  status?: number | string;
  documentNumber?: string | null;
  createdAt?: string;
  role?: RoleInfo;
  documentType?: DocumentTypeInfo | null;
}

// 5. AUTENTICACIÓN Y CONTEXTO MULTI-TENANT
export interface JwtPayload {
  sub: string;
  email: string;
  roleCode: RoleCode;
  organizationId?: string | null;
  residentialComplexId?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: UserSession;
  permissions?: PermissionCode[];
}

export interface AuthState {
  accessToken: string | null;
  user: UserSession | null;
  permissions: PermissionCode[];
  isAuthenticated: boolean;
  organizationId: string | null;
  residentialComplexId: string | null;
  roleCode: RoleCode | null;
}

export interface SwitchComplexRequest {
  residentialComplexId: string;
}

export interface SwitchComplexResponse {
  accessToken: string;
  permissions?: PermissionCode[];
  user?: UserSession;
}

export interface ValidationErrorResponse {
  message: string[] | string;
  error?: string;
  statusCode?: number;
}

// 6. DOMINIO OPERATIVO (Visitantes)
export interface VisitorListItem {
  id: string;
  fullName: string;
  documentNumber?: string | null;
  unitNumber?: string | null;
  unitTarget?: string | null;
  entryTime?: string | null;
  exitTime?: string | null;
  status?: "active" | "closed" | string;
  createdAt?: string;
  authorizerUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
