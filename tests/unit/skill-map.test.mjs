import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { listSkillIds } from "../../app/practice/generators/registry.ts";
import { SKILL_MAP, getSkillsForConcept } from "../../app/practice/skill-map.ts";

test("every registered generator has a skill-map entry", () => {
  for (const skillId of listSkillIds()) {
    assert.ok(SKILL_MAP[skillId], `missing skill-map entry for ${skillId}`);
  }
});

test("skill-map entries reference core notes that actually exist", async () => {
  const source = await readFile(new URL("../../app/study-content.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.coreNoteId) continue;
    assert.ok(source.includes(`id: "${entry.coreNoteId}"`), `unknown core note: ${entry.coreNoteId}`);
  }
});

test("skill-map entries reference foundation capsules that actually exist", async () => {
  const source = await readFile(new URL("../../app/foundation-reference.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.foundationId) continue;
    assert.ok(source.includes(`id: "${entry.foundationId}"`), `unknown capsule: ${entry.foundationId}`);
  }
});

test("skill-map entries reference math concepts that actually exist", async () => {
  const source = await readFile(new URL("../../app/math-curriculum.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.conceptId) continue;
    assert.ok(source.includes(`id: "${entry.conceptId}"`), `unknown concept: ${entry.conceptId}`);
  }
});

test("getSkillsForConcept finds skills attached to a curriculum concept", () => {
  assert.deepEqual(getSkillsForConcept("linear-equations"), ["ma-linear-eq"]);
  assert.deepEqual(getSkillsForConcept("no-such-concept"), []);
});

test("every entry declares a label and a target seconds budget", () => {
  for (const [skillId, entry] of Object.entries(SKILL_MAP)) {
    assert.ok(entry.label.trim(), `${skillId} has no label`);
    assert.ok(entry.targetSeconds > 0, `${skillId} has no targetSeconds`);
  }
});
