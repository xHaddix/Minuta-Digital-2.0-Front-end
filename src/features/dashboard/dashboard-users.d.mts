import type { User } from "../../types/user";

export function getDashboardUsers(users: User[], activeComplexId: string | null): User[];
export function countPendingActivationUsers(users: User[]): number;
