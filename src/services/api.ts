import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { APP_CONFIG } from "../config/app";
import { clearStoredAuth, getStoredAuth } from "../auth/auth-storage";
import type { ValidationErrorResponse } from "../types/auth";

const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
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
    const requestUrl = error.config?.url ?? "";
    const isPublicAuthFlow =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/activate") ||
      requestUrl.includes("/auth/resend-activation") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    if (status === 401 && !isPublicAuthFlow) {
      clearStoredAuth();
      window.location.assign("/login");
    }

    if (
      status === 403 &&
      !isPublicAuthFlow &&
      window.location.pathname !== "/dashboard"
    ) {
      window.location.assign("/dashboard");
    }

    return Promise.reject(error);
  },
);

export default api;
export type { AxiosRequestConfig, AxiosResponse };
