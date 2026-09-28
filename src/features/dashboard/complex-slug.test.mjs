import test from "node:test";
import assert from "node:assert/strict";
import { slugifyComplexName } from "./complex-slug.mjs";

test("complex slug is generated internally from its name", () => {
  assert.equal(slugifyComplexName(" Mirador de los Pinos "), "mirador-de-los-pinos");
  assert.equal(slugifyComplexName("Conjunto Residencial Ñandú"), "conjunto-residencial-nandu");
});
