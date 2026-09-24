export interface ResidentListItem {
  id: string;
  unitNumber: string;
  apartmentId?: string | null;
  isOwner: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
