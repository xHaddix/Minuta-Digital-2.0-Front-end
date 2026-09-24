import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { VisitorListItem } from "../types/visitor";

/**
 * Obtiene la lista de visitantes del conjunto residencial activo.
 */
export const fetchVisitors = async (): Promise<VisitorListItem[]> => {
  const response = await api.get<VisitorListItem[]>(AUTH_ENDPOINTS.visitors);
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
