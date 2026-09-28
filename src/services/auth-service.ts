import api, { setApiAccessToken } from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  LoginResponse,
  SwitchComplexRequest,
  SwitchComplexResponse,
} from "../types/auth";

export const login = async (
  email: string,
  password: string,
  rememberMe = false,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.login, {
    email,
    password,
    rememberMe,
  });

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
