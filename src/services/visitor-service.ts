import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  RegisterVisitorEntryPayload,
  VisitorListItem,
} from "../types/visitor";

/**
 * Obtiene la lista de visitantes del conjunto residencial activo.
 */
export const fetchVisitors = async (): Promise<VisitorListItem[]> => {
  const response = await api.get<VisitorListItem[]>(AUTH_ENDPOINTS.visitors);
  return response.data;
};

export const registerVisitorEntry = async (
  payload: RegisterVisitorEntryPayload,
): Promise<VisitorListItem> => {
  const response = await api.post<VisitorListItem>(
    AUTH_ENDPOINTS.visitors,
    payload,
  );
  return response.data;
};

/**
 * Registra la salida de un visitante especificando su UUID.
 */
export const markVisitorExit = async (
  visitorId: string,
): Promise<VisitorListItem> => {
  const response = await api.patch<VisitorListItem>(
    `${AUTH_ENDPOINTS.visitors}/${visitorId}/exit`,
  );
  return response.data;
};
