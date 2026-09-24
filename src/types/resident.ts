export interface ResidentListItem {
  id: string;
  unitNumber: string;
  apartmentId?: string | null;
  residentialComplexId?: string | null;
  complexId?: string | null;
  isOwner: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
