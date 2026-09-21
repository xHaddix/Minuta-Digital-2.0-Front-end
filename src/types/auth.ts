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

export interface UserSession {
  id: string;
  email: string;
  name: string;
  roleCode: RoleCode;
}

export interface LoginResponse {
  accessToken: string;
  user: UserSession;
  permissions: PermissionCode[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  roleCode: RoleCode;
  organizationId?: string | null;
  residentialComplexId?: string | null;
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
  permissions: PermissionCode[];
}

export interface ValidationErrorResponse {
  message: string[] | string;
  error?: string;
  statusCode?: number;
}

export interface Visitor {
  id: string;
  fullName: string;
  unitNumber: string;
  status: "active" | "closed";
  createdAt: string;
}
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  roleCode: RoleCode;
  organizationId?: string | null;
  residentialComplexId?: string | null;
}
