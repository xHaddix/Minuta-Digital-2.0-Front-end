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

let activeAccessToken: string | null | undefined;

export const setApiAccessToken = (accessToken: string | null) => {
  activeAccessToken = accessToken;
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  const token =
    activeAccessToken === undefined
      ? getStoredAuth()?.accessToken
      : activeAccessToken;

  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;

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
      setApiAccessToken(null);
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
