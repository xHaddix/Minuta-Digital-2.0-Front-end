import test from "node:test";
import assert from "node:assert/strict";
import { ADMINISTRATORS_FILTER, filterUsers } from "./user-filter.mjs";

const users = [
  { id: "dev-1", role: { id: "dev", code: "ROLE_DEV" }, residentialComplexId: null },
  { id: "org-admin-1", role: { id: "org-admin", code: "ROLE_ORG_ADMIN" }, residentialComplexId: null },
  { id: "complex-admin-1", role: { id: "complex-admin", code: "ROLE_COMPLEX_ADMIN" }, residentialComplexId: "complex-1" },
  { id: "complex-admin-2", role: { id: "complex-admin", code: "ROLE_COMPLEX_ADMIN" }, residentialComplexId: "complex-2" },
  { id: "resident-1", role: { id: "resident", code: "ROLE_RESIDENT" }, residentialComplexId: "complex-1" },
];

test("administrators filter includes administrators across all complexes", () => {
  assert.deepEqual(
    filterUsers(users, ADMINISTRATORS_FILTER, "complex-1").map((user) => user.id),
    ["dev-1", "org-admin-1", "complex-admin-1", "complex-admin-2"],
  );
});

test("all users filter stays limited to the active complex", () => {
  assert.deepEqual(
    filterUsers(users, "ALL", "complex-1").map((user) => user.id),
    ["complex-admin-1", "resident-1"],
  );
});

test("a specific role filter stays limited to the active complex", () => {
  assert.deepEqual(
    filterUsers(users, "resident", "complex-1").map((user) => user.id),
    ["resident-1"],
  );
});
