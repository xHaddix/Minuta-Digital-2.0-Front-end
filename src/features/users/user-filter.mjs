export const ADMINISTRATORS_FILTER = "__ADMINISTRATORS__";

const ADMINISTRATOR_ROLE_CODES = new Set([
  "ROLE_DEV",
  "ROLE_ORG_ADMIN",
  "ROLE_COMPLEX_ADMIN",
]);

/**
 * Devuelve los usuarios visibles según el filtro seleccionado.
 * El filtro especial de administradores abarca todos los conjuntos; los demás
 * filtros conservan el alcance del conjunto activo.
 */
export const filterUsers = (users, selectedRoleFilter, activeComplexId) => {
  if (selectedRoleFilter === ADMINISTRATORS_FILTER) {
    return users.filter((user) =>
      ADMINISTRATOR_ROLE_CODES.has(user.role?.code ?? ""),
    );
  }

  const scopedUsers = activeComplexId
    ? users.filter((user) => user.residentialComplexId === activeComplexId)
    : users;

  if (selectedRoleFilter === "ALL") return scopedUsers;
  return scopedUsers.filter((user) => user.role?.id === selectedRoleFilter);
};
