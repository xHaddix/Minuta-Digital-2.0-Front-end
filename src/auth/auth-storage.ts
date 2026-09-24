import { APP_CONFIG } from "../config/app";
import type {
  AuthState,
  JwtPayload,
  PermissionCode,
  RoleCode,
  UserSession,
} from "../types/auth";

const AUTH_CHANGED_EVENT = "minuta-digital-auth-changed";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

const ROLE_CODES: ReadonlySet<string> = new Set<RoleCode>([
  "ROLE_DEV",
  "ROLE_ORG_ADMIN",
  "ROLE_COMPLEX_ADMIN",
  "ROLE_SECURITY",
  "ROLE_RESIDENT",
]);

const PERMISSION_CODES: ReadonlySet<string> = new Set<PermissionCode>([
  "users:read",
  "users:create",
  "users:update",
  "users:delete",
  "visitors:read",
  "visitors:create",
  "visitors:authorize",
  "visitors:check_out",
  "correspondence:read",
  "correspondence:read_own",
  "correspondence:create",
  "correspondence:deliver",
  "amenities:read",
  "amenities:manage",
  "amenities:book",
  "amenities:approve",
  "amenities:verify",
  "pqrs:read_own",
  "pqrs:read_all",
  "pqrs:create",
  "pqrs:respond",
  "pqrs:close",
  "events:read",
  "events:create",
  "marketplace:read",
  "marketplace:create",
  "marketplace:manage_own",
  "marketplace:moderate",
  "complexes:manage",
  "organizations:manage",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRoleCode = (value: unknown): value is RoleCode =>
  typeof value === "string" && ROLE_CODES.has(value);

const isPermissionCode = (value: unknown): value is PermissionCode =>
  typeof value === "string" && PERMISSION_CODES.has(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isUserSession = (value: unknown): value is UserSession => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    isRoleCode(value.roleCode) &&
    isNullableString(value.organizationId) &&
    isNullableString(value.residentialComplexId)
  );
};

const isAuthState = (value: unknown): value is AuthState => {
  if (!isRecord(value)) return false;

  return (
    isNullableString(value.accessToken) &&
    (value.user === null || isUserSession(value.user)) &&
    Array.isArray(value.permissions) &&
    value.permissions.every(isPermissionCode) &&
    typeof value.isAuthenticated === "boolean" &&
    isNullableString(value.organizationId) &&
    isNullableString(value.residentialComplexId) &&
    (value.roleCode === null || isRoleCode(value.roleCode)) &&
    (value.contextSelected === undefined ||
      typeof value.contextSelected === "boolean")
  );
};

const isJwtPayload = (value: unknown): value is JwtPayload => {
  if (!isRecord(value)) return false;

  return (
    typeof value.sub === "string" &&
    typeof value.email === "string" &&
    isRoleCode(value.roleCode) &&
    (value.organizationId === undefined ||
      isNullableString(value.organizationId)) &&
    (value.residentialComplexId === undefined ||
      isNullableString(value.residentialComplexId))
  );
};

export const decodeJwtPayload = (accessToken: string): JwtPayload | null => {
  try {
    const payloadSegment = accessToken.split(".")[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(paddedBase64);
    const payload: unknown = JSON.parse(decoded);

    return isJwtPayload(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const getStoredAuth = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isAuthState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: AuthState) => {
  localStorage.setItem(APP_CONFIG.AUTH_STORAGE_KEY, JSON.stringify(auth));
  notifyAuthChanged();
};

export const clearStoredAuth = () => {
  localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
  notifyAuthChanged();
};

export const buildAuthState = (payload: {
  accessToken: string;
  user: AuthState["user"];
  permissions: AuthState["permissions"];
  organizationId?: string | null;
  residentialComplexId?: string | null;
  roleCode?: AuthState["roleCode"];
  contextSelected?: boolean;
}): AuthState => {
  const jwtPayload = decodeJwtPayload(payload.accessToken);

  return {
    accessToken: payload.accessToken,
    user: payload.user,
    permissions: payload.permissions,
    isAuthenticated: !!payload.accessToken,
    organizationId:
      payload.organizationId !== undefined
        ? payload.organizationId
        : (jwtPayload?.organizationId ?? null),
    residentialComplexId:
      payload.residentialComplexId !== undefined
        ? payload.residentialComplexId
        : (jwtPayload?.residentialComplexId ?? null),
    roleCode:
      payload.roleCode ??
      jwtPayload?.roleCode ??
      payload.user?.roleCode ??
      null,
    contextSelected:
      payload.contextSelected ?? payload.residentialComplexId !== null,
  };
};
