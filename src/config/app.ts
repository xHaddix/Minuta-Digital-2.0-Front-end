const defaultApiBaseUrl =
  "https://minuta-digital-2-0-back-end.onrender.com/api";

const defaultFrontendUrl = "https://minutadigital.vercel.app";

const resolvedApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    "",
  ) || defaultApiBaseUrl;

export const FRONTEND_URL =
  (import.meta.env.VITE_FRONTEND_URL as string | undefined)?.replace(
    /\/+$/,
    "",
  ) || defaultFrontendUrl;

export const APP_CONFIG = {
  API_BASE_URL: resolvedApiBaseUrl,
  AUTH_STORAGE_KEY: "minuta-digital-auth",
  SESSION_STORAGE_KEY: "minuta-digital-session",
};

export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  activate: "/auth/activate",
  resendActivation: "/auth/resend-activation",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

export const roleLabels: Record<string, string> = {
  ROLE_DEV: "Desarrollador",
  ROLE_ORG_ADMIN: "Administrador de Organización",
  ROLE_COMPLEX_ADMIN: "Administrador del Conjunto",
  ROLE_SECURITY: "Seguridad",
  ROLE_RESIDENT: "Residente",
};
