import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type {
  Organization,
  ResidentialComplex,
  SwitchComplexRequest,
  SwitchComplexResponse,
} from "../types/auth";

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

export const switchComplex = async (residentialComplexId: string) => {
  const response = await api.post<SwitchComplexResponse>(
    AUTH_ENDPOINTS.switchComplex,
    {
      residentialComplexId,
    } satisfies SwitchComplexRequest,
  );

  return response.data;
};
