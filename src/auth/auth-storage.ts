import { APP_CONFIG } from "../config/app";
import type { AuthState } from "../types/auth";

export const getStoredAuth = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: AuthState) => {
  localStorage.setItem(APP_CONFIG.AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
};

export const buildAuthState = (payload: {
  accessToken: string;
  user: AuthState["user"];
  permissions: AuthState["permissions"];
  organizationId?: string | null;
  residentialComplexId?: string | null;
  roleCode?: AuthState["roleCode"];
}): AuthState => ({
  accessToken: payload.accessToken,
  user: payload.user,
  permissions: payload.permissions,
  isAuthenticated: !!payload.accessToken,
  organizationId: payload.organizationId ?? null,
  residentialComplexId: payload.residentialComplexId ?? null,
  roleCode: payload.roleCode ?? payload.user?.roleCode ?? null,
});
