import type { User } from "../../types/user";

export const ADMINISTRATORS_FILTER: "__ADMINISTRATORS__";
export function filterUsers(
  users: User[],
  selectedRoleFilter: string,
  activeComplexId: string | null,
): User[];
