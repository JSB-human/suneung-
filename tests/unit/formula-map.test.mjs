import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { FORMULA_MAP } from "../../app/path/formula-map.ts";

test("every mapped note id exists in CORE_NOTES", async () => {
  const source = await readFile(new URL("../../app/study-content.ts", import.meta.url), "utf8");
  for (const [sourceId, noteId] of Object.entries(FORMULA_MAP)) {
    assert.ok(source.includes(`id: "${noteId}"`), `${sourceId} maps to unknown note: ${noteId}`);
  }
});

test("every mapped source id exists as a capsule or a curriculum concept", async () => {
  const [foundation, language, math] = await Promise.all([
    readFile(new URL("../../app/foundation-reference.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/language-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/math-curriculum.ts", import.meta.url), "utf8"),
  ]);
  const all = foundation + language + math;
  for (const sourceId of Object.keys(FORMULA_MAP)) {
    assert.ok(all.includes(`id: "${sourceId}"`), `unknown source id: ${sourceId}`);
  }
});

test("the map is not trivially small", () => {
  assert.ok(Object.keys(FORMULA_MAP).length >= 20, `expected at least 20 mappings, got ${Object.keys(FORMULA_MAP).length}`);
});
