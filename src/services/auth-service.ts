import axios, { type AxiosResponse } from "axios";
import api, { setApiAccessToken } from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  LoginResponse,
  DataTreatmentConsentResponse,
  SwitchComplexRequest,
  SwitchComplexResponse,
} from "../types/auth";

export const login = async (
  email: string,
  password: string,
  rememberMe = false,
): Promise<LoginResponse> => {
  let response: AxiosResponse<LoginResponse>;

  try {
    response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, {
      email,
      password,
      rememberMe,
    });
  } catch (error) {
    const message = axios.isAxiosError<{ message?: string | string[] }>(error)
      ? error.response?.data?.message
      : undefined;
    const messages = Array.isArray(message) ? message : [message];
    const backendDoesNotSupportRememberMe = messages.some(
      (item) =>
        typeof item === "string" &&
        item.toLowerCase().includes("property rememberme should not exist"),
    );

    if (!rememberMe || !backendDoesNotSupportRememberMe) {
      throw error;
    }

    // Permite iniciar sesión mientras el backend desplegado se actualiza.
    response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, {
      email,
      password,
    });
  }

  setApiAccessToken(response.data.accessToken);
  return response.data;
};

export const switchComplex = async (
  residentialComplexId: string,
): Promise<SwitchComplexResponse> => {
  const payload = { residentialComplexId } satisfies SwitchComplexRequest;
  const response = await api.post<SwitchComplexResponse>(
    AUTH_ENDPOINTS.switchComplex,
    payload,
  );

  setApiAccessToken(response.data.accessToken);
  return response.data;
};

export const acceptDataTreatmentConsent = async (
  version: string,
): Promise<DataTreatmentConsentResponse> => {
  const response = await api.post<DataTreatmentConsentResponse>(
    AUTH_ENDPOINTS.dataTreatmentConsent,
    { version },
  );
  return response.data;
};
