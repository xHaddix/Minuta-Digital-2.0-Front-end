import test from "node:test";
import assert from "node:assert/strict";
import { getDashboardUsers } from "./dashboard-users.mjs";

const users = [
  { id: "resident", residentialComplexId: "complex-a", status: 1, role: { code: "ROLE_RESIDENT" } },
  { id: "pending", residentialComplexId: "complex-a", status: 2, role: { code: "ROLE_SECURITY" } },
  { id: "other-complex", residentialComplexId: "complex-b", status: 0, role: { code: "ROLE_RESIDENT" } },
  { id: "dev", residentialComplexId: "complex-a", status: 2, role: { code: "ROLE_DEV" } },
];

test("dashboard users are scoped to the selected complex and omit developers", () => {
  assert.deepEqual(
    getDashboardUsers(users, "complex-a").map((user) => user.id),
    ["resident", "pending"],
  );
});

test("dashboard doesn't count users across all complexes without a selected complex", () => {
  assert.deepEqual(getDashboardUsers(users, null), []);
});
