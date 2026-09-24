import type { RoleCode } from "./auth";

export interface DocumentType {
  id: string;
  code: string;
  description: string | null;
}

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  description: string | null;
}

export interface ResidentialComplex {
  id: string;
  name: string;
  slug?: string;
  organizationId?: string;
  urlLogo?: string | null;
  logoUrl?: string | null;
  contactEmail?: string;
  contactPhone?: string | null;
  status?: number | string;
  planCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  status: number;
  organizationId?: string | null;
  residentialComplexId?: string | null;
  documentNumber?: string | null;
  createdAt?: string;
  role?: {
    id: string;
    code: RoleCode;
    name: string;
  };
  documentType?: {
    id: string;
    code: string;
    description?: string | null;
  } | null;
}

export interface InviteUserPayload {
  email: string;
  name: string;
  phone?: string;
  roleId: string;
  organizationId?: string;
  residentialComplexId?: string;
  documentTypeId?: string;
  documentNumber?: string;
}

export interface InviteUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    status: number;
  };
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  roleId?: string;
  documentTypeId?: string;
  documentNumber?: string;
  status?: number;
}
