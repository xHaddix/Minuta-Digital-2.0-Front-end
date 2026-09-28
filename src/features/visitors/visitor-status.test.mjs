import test from "node:test";
import assert from "node:assert/strict";
import { isVisitorActive } from "./visitor-status.mjs";

test("a visitor with an exit time is not active", () => {
  assert.equal(isVisitorActive({ status: "active", exitTime: "2026-09-27T10:00:00Z" }), false);
});

test("closed visitors are not active even when exit time is missing", () => {
  assert.equal(isVisitorActive({ status: "closed", exitTime: null }), false);
});

test("active visitors without an exit time remain active", () => {
  assert.equal(isVisitorActive({ status: "active", exitTime: null }), true);
});
