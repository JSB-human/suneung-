import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { generateQuestion, listSkillIds } from "../../app/practice/generators/registry.ts";

test("every registered skill generates valid questions at every level", () => {
  for (const skillId of listSkillIds()) {
    for (const level of [1, 2, 3]) {
      for (let seed = 0; seed < 50; seed += 1) {
        const question = generateQuestion(skillId, seed, level);
        const violations = findQuestionViolations(question);
        assert.deepEqual(violations, [], `${skillId} seed ${seed} level ${level}: ${violations.join(", ")}`);
      }
    }
  }
});

test("generateQuestion stamps skillId, seed and level onto the result", () => {
  const question = generateQuestion("ma-linear-eq", 123, 2);
  assert.equal(question.skillId, "ma-linear-eq");
  assert.equal(question.seed, 123);
  assert.equal(question.level, 2);
});

test("the same skillId, seed and level always reproduce the same question", () => {
  for (const skillId of listSkillIds()) {
    assert.deepEqual(generateQuestion(skillId, 55, 1), generateQuestion(skillId, 55, 1));
  }
});

test("different seeds reproduce different questions", () => {
  const prompts = new Set();
  for (let seed = 0; seed < 40; seed += 1) {
    prompts.add(generateQuestion("ma-factor", seed, 2).prompt);
  }
  assert.ok(prompts.size > 25, `expected variety, got ${prompts.size}`);
});

test("an unknown skillId throws a named error", () => {
  assert.throws(() => generateQuestion("no-such-skill", 1, 1), /no-such-skill/);
});

test("all five planned math skills are registered", () => {
  assert.deepEqual(
    [...listSkillIds()].sort(),
    ["ma-factor", "ma-frac-arith", "ma-linear-eq", "ma-poly-expand", "ma-quad-eq"],
  );
});
