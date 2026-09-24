import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { ResidentListItem } from "../types/resident";

export const fetchResidents = async (): Promise<ResidentListItem[]> => {
  const response = await api.get<ResidentListItem[]>(AUTH_ENDPOINTS.residents);
  return response.data;
};

export const createResidentForApartment = async (
  userId: string,
  apartmentId: string,
): Promise<ResidentListItem> => {
  const response = await api.post<ResidentListItem>(AUTH_ENDPOINTS.residents, {
    userId,
    apartmentId,
    isOwner: false,
  });
  return response.data;
};

export const assignResidentApartment = async (
  residentId: string,
  apartmentId: string,
): Promise<ResidentListItem> => {
  const response = await api.patch<ResidentListItem>(
    `${AUTH_ENDPOINTS.residents}/${residentId}/apartment`,
    { apartmentId },
  );
  return response.data;
};

export const unassignResidentApartment = async (
  residentId: string,
): Promise<ResidentListItem> => {
  const response = await api.delete<ResidentListItem>(
    `${AUTH_ENDPOINTS.residents}/${residentId}/apartment`,
  );
  return response.data;
};
