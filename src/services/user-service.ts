import api from "./api";
import { AUTH_ENDPOINTS } from "../config/app";
import type { UserListItem, VisitorListItem } from "../types/auth";

const filterUsersForCurrentComplex = (
  users: UserListItem[],
  residentialComplexId?: string | null,
  currentUserId?: string | null,
) => {
  if (!residentialComplexId) {
    return users.filter((user) => user.id === currentUserId);
  }

  return users.filter(
    (user) =>
      user.id === currentUserId ||
      user.residentialComplexId === residentialComplexId,
  );
};

export const fetchUsers = async (
  residentialComplexId?: string | null,
  currentUserId?: string | null,
) => {
  const response = await api.get<UserListItem[]>(AUTH_ENDPOINTS.users);
  return filterUsersForCurrentComplex(
    response.data,
    residentialComplexId,
    currentUserId,
  );
};

export const fetchVisitors = async () => {
  const response = await api.get<VisitorListItem[]>(AUTH_ENDPOINTS.visitors);
  return response.data;
};

export const markVisitorExit = async (visitorId: string) => {
  const response = await api.patch<VisitorListItem>(
    `${AUTH_ENDPOINTS.visitors}/${visitorId}/exit`,
  );
  return response.data;
};
