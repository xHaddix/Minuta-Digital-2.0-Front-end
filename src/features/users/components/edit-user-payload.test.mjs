import assert from "node:assert/strict";
import test from "node:test";
import { buildUpdateUserPayload } from "./edit-user-payload.ts";

test("role change sends the selected role and never sends organizationId", () => {
  const payload = buildUpdateUserPayload({
    name: " Ricardo Parra ",
    phone: " 3223909898 ",
    roleId: "security-role-id",
    documentTypeId: "foreign-id-type",
    documentNumber: " 123132132 ",
    status: 1,
  });

  assert.deepEqual(payload, {
    name: "Ricardo Parra",
    phone: "3223909898",
    roleId: "security-role-id",
    documentTypeId: "foreign-id-type",
    documentNumber: "123132132",
    status: 1,
  });
  assert.equal(Object.hasOwn(payload, "organizationId"), false);
});

test("empty optional fields are omitted while status remains numeric", () => {
  const payload = buildUpdateUserPayload({
    name: " Resident ",
    phone: " ",
    roleId: "",
    documentTypeId: "",
    documentNumber: " ",
    status: 0,
  });

  assert.deepEqual(payload, {
    name: "Resident",
    phone: undefined,
    roleId: undefined,
    documentTypeId: undefined,
    documentNumber: undefined,
    status: 0,
  });
});
