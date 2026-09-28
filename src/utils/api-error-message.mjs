const knownMessages = new Map([
  ["phone must be a valid phone number", "El teléfono debe ser un número válido."],
  ["phone must be a phone number", "El teléfono debe ser un número válido."],
  ["email must be an email", "Ingresa un correo electrónico válido."],
  ["email must be a valid email address", "Ingresa un correo electrónico válido."],
  ["name should not be empty", "El nombre es obligatorio."],
  ["name must be a string", "El nombre tiene un formato no válido."],
  ["roleid should not be empty", "Debes seleccionar un rol."],
  ["roleid must be a uuid", "El rol seleccionado no es válido."],
  ["status must be a number conforming to the specified constraints", "El estado seleccionado no es válido."],
]);

export const translateApiMessage = (message) => {
  const trimmed = String(message ?? "").trim();
  if (!trimmed) return "";
  return knownMessages.get(trimmed.toLocaleLowerCase()) ?? trimmed;
};

export const getApiErrorMessage = (error, fallback = "Ocurrió un error. Inténtalo de nuevo.") => {
  const responseMessage = error && typeof error === "object"
    ? error.response?.data?.message
    : undefined;
  const messages = Array.isArray(responseMessage)
    ? responseMessage.map(translateApiMessage).filter(Boolean)
    : [translateApiMessage(responseMessage)].filter(Boolean);

  if (messages.length) return [...new Set(messages)].join(" ");
  if (error instanceof Error && error.message) return translateApiMessage(error.message);
  return fallback;
};
