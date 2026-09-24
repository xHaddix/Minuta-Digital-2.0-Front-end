import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  LoginResponse,
  SwitchComplexRequest,
  SwitchComplexResponse,
} from "../types/auth";

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, {
    email,
    password,
  });

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

  return response.data;
};
