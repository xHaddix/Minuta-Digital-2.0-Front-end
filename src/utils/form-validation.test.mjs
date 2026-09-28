import test from "node:test";
import assert from "node:assert/strict";
import { getLocalizedValidationMessage } from "./form-validation.mjs";

test("required fields receive a Spanish message with their label", () => {
  assert.equal(
    getLocalizedValidationMessage({ valueMissing: true }, "Nombre Completo *"),
    "Ingresa nombre completo.",
  );
});

test("email and pattern errors are localized", () => {
  assert.equal(
    getLocalizedValidationMessage({ typeMismatch: true, type: "email" }),
    "Ingresa un correo electrónico válido.",
  );
  assert.equal(
    getLocalizedValidationMessage({ patternMismatch: true }, "Slug *"),
    "Revisa el formato de slug.",
  );
});

test("length and range validation errors explain the expected values", () => {
  assert.equal(getLocalizedValidationMessage({ tooShort: true, minLength: 3 }), "Ingresa al menos 3 caracteres.");
  assert.equal(getLocalizedValidationMessage({ rangeOverflow: true, max: "10" }), "El valor debe ser igual o menor a 10.");
});
