import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { Organization } from "../types/auth";
import type { ResidentialComplex } from "../types/user";

export interface CreateOrganizationPayload {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  identification?: string;
}

export interface CreateComplexPayload {
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  organizationId?: string;
  planCode?: string;
}

export const createOrganization = async (payload: CreateOrganizationPayload) => {
  const response = await api.post<Organization>(AUTH_ENDPOINTS.organizations, payload);
  return response.data;
};

export const createResidentialComplex = async (payload: CreateComplexPayload) => {
  const response = await api.post<ResidentialComplex>(AUTH_ENDPOINTS.residentialComplexes, payload);
  return response.data;
};

export const fetchOrganizations = async () => {
  const response = await api.get<Organization[]>(AUTH_ENDPOINTS.organizations);
  return response.data;
};

export const fetchResidentialComplexes = async (
  organizationId?: string | null,
) => {
  const response = await api.get<ResidentialComplex[]>(
    AUTH_ENDPOINTS.residentialComplexes,
    organizationId
      ? {
          params: { organizationId },
        }
      : undefined,
  );

  return response.data;
};
