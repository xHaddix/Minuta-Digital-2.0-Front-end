export const getDashboardUsers = (users, activeComplexId) => {
  if (!activeComplexId) return [];
  return users.filter((user) =>
    user.residentialComplexId === activeComplexId && user.role?.code !== "ROLE_DEV",
  );
};

export const countPendingActivationUsers = (users) =>
  users.filter((user) => user.status === 2).length;
