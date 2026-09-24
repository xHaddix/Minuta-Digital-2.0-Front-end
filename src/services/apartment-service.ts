import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { ApartmentListItem, ApartmentPayload } from "../types/apartment";

export const fetchApartments = async (
  includeInactive = false,
): Promise<ApartmentListItem[]> => {
  const response = await api.get<ApartmentListItem[]>(
    AUTH_ENDPOINTS.apartments,
    {
      params: includeInactive ? { includeInactive: true } : undefined,
    },
  );
  return response.data;
};

export const createApartment = async (
  payload: ApartmentPayload,
): Promise<ApartmentListItem> => {
  const response = await api.post<ApartmentListItem>(
    AUTH_ENDPOINTS.apartments,
    payload,
  );
  return response.data;
};

export const updateApartment = async (
  apartmentId: string,
  payload: Partial<ApartmentPayload>,
): Promise<ApartmentListItem> => {
  const response = await api.patch<ApartmentListItem>(
    `${AUTH_ENDPOINTS.apartments}/${apartmentId}`,
    payload,
  );
  return response.data;
};

export const deactivateApartment = async (apartmentId: string) => {
  await api.delete(`${AUTH_ENDPOINTS.apartments}/${apartmentId}`);
};
