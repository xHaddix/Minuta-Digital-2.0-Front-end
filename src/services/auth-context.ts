import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { Organization } from "../types/auth";
import type { ResidentialComplex } from "../types/user";

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
