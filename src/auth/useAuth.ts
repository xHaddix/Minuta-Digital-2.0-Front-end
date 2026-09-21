import { useCallback, useMemo } from "react";
import api from "../services/api";
import { APP_CONFIG } from "../config/app";
import type {
  AuthState,
  LoginResponse,
  PermissionCode,
  SwitchComplexResponse,
} from "../types/auth";
import {
  buildAuthState,
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "./auth-storage";

export const useAuth = () => {
  const readAuth = useCallback((): AuthState | null => getStoredAuth(), []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    const auth = buildAuthState({
      accessToken: data.accessToken,
      user: data.user,
      permissions: data.permissions,
      organizationId: null,
      residentialComplexId: null,
      roleCode: data.user.roleCode,
    });

    setStoredAuth(auth);
    return data;
  }, []);

  const switchComplex = useCallback(async (residentialComplexId: string) => {
    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      throw new Error("No hay sesión activa");
    }

    const { data } = await api.post<SwitchComplexResponse>(
      "/auth/switch-complex",
      {
        residentialComplexId,
      },
    );

    const nextAuth = buildAuthState({
      accessToken: data.accessToken,
      user: auth.user,
      permissions: data.permissions,
      organizationId: auth.organizationId,
      residentialComplexId,
      roleCode: auth.roleCode ?? auth.user?.roleCode ?? null,
    });

    setStoredAuth(nextAuth);
    return nextAuth;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    window.location.assign("/login");
  }, []);

  const can = useCallback((permission: PermissionCode) => {
    const auth = getStoredAuth();
    return !!auth && auth.permissions.includes(permission);
  }, []);

  const getPermissions = useCallback((): PermissionCode[] => {
    const auth = getStoredAuth();
    return auth?.permissions ?? [];
  }, []);

  const hasActiveComplex = useCallback(() => {
    const auth = getStoredAuth();
    const role = auth?.roleCode;
    if (role === "ROLE_DEV") return true;
    return !!auth?.residentialComplexId;
  }, []);

  const isAuthenticated = useCallback(() => !!getStoredAuth()?.accessToken, []);

  const session = useMemo(() => readAuth(), [readAuth]);

  return {
    session,
    login,
    switchComplex,
    logout,
    can,
    getPermissions,
    hasActiveComplex,
    isAuthenticated,
    clearAuth: clearStoredAuth,
    storageKey: APP_CONFIG.AUTH_STORAGE_KEY,
  };
};

export const usePermission = (permission: PermissionCode) => {
  const { can } = useAuth();
  return can(permission);
};
