import test from "node:test";
import assert from "node:assert/strict";
import { getApiErrorMessage, translateApiMessage } from "./api-error-message.mjs";

test("translates phone validation errors returned by the API", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { message: "phone must be a valid phone number" } } }),
    "El teléfono debe ser un número válido.",
  );
});

test("translates and combines multiple validation messages", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { message: ["name should not be empty", "email must be an email"] } } }),
    "El nombre es obligatorio. Ingresa un correo electrónico válido.",
  );
});

test("preserves backend messages not covered by the translation catalog", () => {
  assert.equal(translateApiMessage("El usuario ya existe"), "El usuario ya existe");
});

test("uses the form fallback when the error has no message", () => {
  assert.equal(getApiErrorMessage({}, "No se pudo guardar."), "No se pudo guardar.");
});
