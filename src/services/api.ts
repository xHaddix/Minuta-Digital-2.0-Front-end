import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { APP_CONFIG } from "../config/app";
import type { AuthState, ValidationErrorResponse } from "../types/auth";

const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const parseStoredAuth = (): Partial<AuthState> | null => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

api.interceptors.request.use((config) => {
  const auth = parseStoredAuth();
  const token = auth?.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ValidationErrorResponse>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY);
      window.location.assign("/login");
      return Promise.reject(error);
    }

    if (status === 403) {
      const errorText = Array.isArray(message)
        ? message.join(", ")
        : "No tiene permisos para esta acción.";
      alert(errorText);
    }

    if (status === 400) {
      const errors = Array.isArray(message)
        ? message
        : [message ?? "Error de validación"];
      const firstError = errors[0];
      if (firstError) {
        alert(firstError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export type { AxiosRequestConfig, AxiosResponse };
