export const getDashboardUsers = (users, activeComplexId) => {
  if (!activeComplexId) return [];
  return users.filter((user) =>
    user.residentialComplexId === activeComplexId && user.role?.code !== "ROLE_DEV",
  );
};
