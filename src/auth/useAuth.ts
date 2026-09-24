import { useCallback, useEffect, useState } from "react";
import { APP_CONFIG } from "../config/app";
import {
  login as loginRequest,
  switchComplex as switchComplexRequest,
} from "../services/auth-service";
import type { AuthState, PermissionCode, RoleCode } from "../types/auth";
import {
  buildAuthState,
  clearStoredAuth,
  getStoredAuth,
  isAuthRemembered,
  setStoredAuthWithPreference,
} from "./auth-storage";

const FALLBACK_PERMISSIONS_BY_ROLE: Record<RoleCode, PermissionCode[]> = {
  ROLE_DEV: [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "visitors:read",
    "visitors:create",
    "visitors:authorize",
    "visitors:check_out",
    "correspondence:read",
    "correspondence:create",
    "correspondence:deliver",
    "amenities:read",
    "amenities:manage",
    "amenities:book",
    "amenities:approve",
    "amenities:verify",
    "pqrs:read_all",
    "pqrs:create",
    "pqrs:respond",
    "pqrs:close",
    "events:read",
    "events:create",
    "complexes:manage",
    "organizations:manage",
  ],
  ROLE_ORG_ADMIN: [
    "users:read",
    "users:create",
    "users:update",
    "visitors:read",
    "visitors:create",
    "visitors:authorize",
    "visitors:check_out",
    "correspondence:read",
    "correspondence:create",
    "correspondence:deliver",
    "amenities:read",
    "amenities:manage",
    "amenities:book",
    "amenities:approve",
    "events:read",
    "events:create",
    "complexes:manage",
  ],
  ROLE_COMPLEX_ADMIN: [
    "users:read",
    "visitors:read",
    "visitors:create",
    "visitors:authorize",
    "visitors:check_out",
    "correspondence:read",
    "correspondence:create",
    "correspondence:deliver",
    "amenities:read",
    "amenities:manage",
    "amenities:book",
    "amenities:approve",
    "pqrs:read_all",
    "pqrs:respond",
    "pqrs:close",
    "events:read",
    "events:create",
  ],
  ROLE_SECURITY: [
    "visitors:read",
    "visitors:create",
    "visitors:check_out",
    "correspondence:read",
    "events:read",
  ],
  ROLE_RESIDENT: [
    "pqrs:read_own",
    "pqrs:create",
    "amenities:read",
    "amenities:book",
  ],
};

const resolvePermissions = (
  roleCode: RoleCode | null | undefined,
  explicit?: PermissionCode[],
) => {
  if (explicit && explicit.length > 0) {
    return explicit;
  }

  if (!roleCode) {
    return [];
  }

  return FALLBACK_PERMISSIONS_BY_ROLE[roleCode] ?? [];
};

export const useAuth = () => {
  const [session, setSession] = useState<AuthState | null>(() =>
    getStoredAuth(),
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setSession(getStoredAuth());
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("minuta-digital-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(
        "minuta-digital-auth-changed",
        handleAuthChange,
      );
    };
  }, []);

  const syncSession = useCallback(() => {
    const nextAuth = getStoredAuth();
    setSession(nextAuth);
    return nextAuth;
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const data = await loginRequest(email, password);

      const requiresContextSelection =
        data.user.roleCode === "ROLE_DEV" ||
        data.user.roleCode === "ROLE_ORG_ADMIN";

      const auth = buildAuthState({
        accessToken: data.accessToken,
        user: data.user,
        permissions: resolvePermissions(data.user.roleCode, data.permissions),
        organizationId: requiresContextSelection
          ? null
          : (data.user.organizationId ?? null),
        residentialComplexId: requiresContextSelection
          ? null
          : (data.user.residentialComplexId ?? null),
        roleCode: data.user.roleCode,
        contextSelected: !requiresContextSelection,
      });

      setStoredAuthWithPreference(auth, rememberMe);
      setSession(auth);
      return data;
    },
    [],
  );

  const switchComplex = useCallback(
    async (
      residentialComplexId: string,
      contextNames?: {
        organizationName?: string | null;
        residentialComplexName?: string | null;
      },
    ) => {
      const auth = getStoredAuth();
      if (!auth?.accessToken) {
        throw new Error("No hay sesión activa");
      }

      const data = await switchComplexRequest(residentialComplexId);

      const nextAuth = buildAuthState({
        accessToken: data.accessToken,
        user: data.user ?? auth.user,
        permissions: resolvePermissions(
          auth.roleCode ?? auth.user?.roleCode ?? null,
          data.permissions,
        ),
        organizationId:
          data.user?.organizationId ?? auth.organizationId ?? null,
        residentialComplexId:
          data.user?.residentialComplexId ?? residentialComplexId,
        organizationName:
          contextNames?.organizationName ??
          data.user?.organizationName ??
          auth.organizationName ??
          null,
        residentialComplexName:
          contextNames?.residentialComplexName ??
          data.user?.residentialComplexName ??
          auth.residentialComplexName ??
          null,
        roleCode: auth.roleCode ?? auth.user?.roleCode ?? null,
        contextSelected: true,
      });

      setStoredAuthWithPreference(nextAuth, isAuthRemembered());
      setSession(nextAuth);
      return nextAuth;
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setSession(null);
    window.location.assign("/login");
  }, []);

  const can = useCallback(
    (permission: PermissionCode) => {
      const auth = session ?? getStoredAuth();
      return !!auth && auth.permissions.includes(permission);
    },
    [session],
  );

  const canAny = useCallback(
    (permissions: PermissionCode[]) => {
      const auth = session ?? getStoredAuth();
      if (!auth) return false;
      return permissions.some((permission) =>
        auth.permissions.includes(permission),
      );
    },
    [session],
  );

  const getPermissions = useCallback((): PermissionCode[] => {
    const auth = session ?? getStoredAuth();
    return auth?.permissions ?? [];
  }, [session]);

  const hasActiveComplex = useCallback(() => {
    const auth = session ?? getStoredAuth();
    return !!auth?.residentialComplexId;
  }, [session]);

  const isAuthenticated = useCallback(
    () => !!(session ?? getStoredAuth())?.accessToken,
    [session],
  );

  return {
    session,
    login,
    switchComplex,
    logout,
    can,
    canAny,
    getPermissions,
    hasActiveComplex,
    isAuthenticated,
    clearAuth: () => {
      clearStoredAuth();
      setSession(null);
    },
    syncSession,
    storageKey: APP_CONFIG.AUTH_STORAGE_KEY,
  };
};

export const usePermission = (permission: PermissionCode) => {
  const { can } = useAuth();
  return can(permission);
};
