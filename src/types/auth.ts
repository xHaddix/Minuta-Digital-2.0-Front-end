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
  | "apartments:read"
  | "apartments:create"
  | "apartments:update"
  | "apartments:delete"
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
  | "marketplace:read"
  | "marketplace:create"
  | "marketplace:manage_own"
  | "marketplace:moderate"
  | "complexes:manage"
  | "organizations:manage";

// 2. ENTIDADES DE DOMINIO BASE
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

// 3. ENTIDAD USUARIO DE SESIÓN
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  roleCode: RoleCode;
  organizationId?: string | null;
  residentialComplexId?: string | null;
  organizationName?: string | null;
  residentialComplexName?: string | null;
}

/// Usado en el estado de sesión de AuthContext
export interface UserSession extends BaseUser {
  roleName?: string;
}

// 4. AUTENTICACIÓN Y CONTEXTO MULTI-TENANT
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
  permissions: PermissionCode[];
}

export interface AuthState {
  accessToken: string | null;
  user: UserSession | null;
  permissions: PermissionCode[];
  isAuthenticated: boolean;
  organizationId: string | null;
  residentialComplexId: string | null;
  organizationName?: string | null;
  residentialComplexName?: string | null;
  roleCode: RoleCode | null;
  contextSelected?: boolean;
}

export interface SwitchComplexRequest {
  residentialComplexId: string;
}

export interface SwitchComplexResponse {
  accessToken: string;
  permissions: PermissionCode[];
  user: UserSession;
}

export interface ValidationErrorResponse {
  message: string[] | string;
  error?: string;
  statusCode?: number;
}
