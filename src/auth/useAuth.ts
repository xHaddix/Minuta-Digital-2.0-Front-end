import { useCallback, useEffect, useState } from "react";
import { APP_CONFIG } from "../config/app";
import {
  login as loginRequest,
  switchComplex as switchComplexRequest,
  acceptDataTreatmentConsent as acceptDataTreatmentConsentRequest,
} from "../services/auth-service";
import { setApiAccessToken } from "../services/api";
import type { AuthState, PermissionCode, RoleCode } from "../types/auth";
import { DATA_TREATMENT_POLICY_VERSION } from "../config/privacy";
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
      const auth = getStoredAuth();
      setApiAccessToken(auth?.accessToken ?? null);
      setSession(auth);
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
    setApiAccessToken(nextAuth?.accessToken ?? null);
    setSession(nextAuth);
    return nextAuth;
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const data = await loginRequest(email, password, rememberMe);

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
        dataTreatmentPolicyVersion:
          data.dataTreatmentPolicyVersion ?? DATA_TREATMENT_POLICY_VERSION,
      });

      setStoredAuthWithPreference(auth, rememberMe);
      setApiAccessToken(auth.accessToken);
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
        dataTreatmentPolicyVersion:
          data.dataTreatmentPolicyVersion ??
          auth.dataTreatmentPolicyVersion ??
          DATA_TREATMENT_POLICY_VERSION,
      });

      setStoredAuthWithPreference(nextAuth, isAuthRemembered());
      setApiAccessToken(nextAuth.accessToken);
      setSession(nextAuth);
      return nextAuth;
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setApiAccessToken(null);
    setSession(null);
    window.location.assign("/login");
  }, []);

  const setProfileName = useCallback((name: string) => {
    const auth = getStoredAuth();
    if (!auth?.user) return;

    const nextAuth = {
      ...auth,
      user: { ...auth.user, name },
    };
    setStoredAuthWithPreference(nextAuth, isAuthRemembered());
    setSession(nextAuth);
  }, []);

  const acceptDataTreatmentConsent = useCallback(async (version: string) => {
    const auth = getStoredAuth();
    if (!auth?.accessToken || !auth.user) {
      throw new Error("No hay una sesion activa para registrar la aceptacion.");
    }

    const result = await acceptDataTreatmentConsentRequest(version);
    const nextAuth: AuthState = {
      ...auth,
      dataTreatmentPolicyVersion: result.policyVersion,
      user: {
        ...auth.user,
        dataTreatmentAcceptedAt: result.acceptedAt,
        dataTreatmentVersion: result.version,
      },
    };

    setStoredAuthWithPreference(nextAuth, isAuthRemembered());
    setSession(nextAuth);
    return nextAuth;
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
    setProfileName,
    acceptDataTreatmentConsent,
    logout,
    can,
    canAny,
    getPermissions,
    hasActiveComplex,
    isAuthenticated,
    clearAuth: () => {
      clearStoredAuth();
      setApiAccessToken(null);
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
