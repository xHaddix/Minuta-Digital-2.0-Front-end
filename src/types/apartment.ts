export interface ApartmentListItem {
  id: string;
  unitNumber: string;
  tower?: string | null;
  apartmentNumber?: string | null;
  unitType?: string;
  status: number;
  residentCount?: number;
  available?: boolean;
}

export interface ApartmentPayload {
  tower?: string;
  apartmentNumber?: string;
  unitNumber?: string;
  unitType?: string;
  status?: number;
}
