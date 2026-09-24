export interface VisitorListItem {
  id: string;
  fullName: string;
  documentNumber?: string | null;
  unitNumber?: string | null;
  unitTarget?: string | null;
  entryTime?: string | null;
  exitTime?: string | null;
  status?: "active" | "closed" | string;
  createdAt?: string;
  authorizerUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
