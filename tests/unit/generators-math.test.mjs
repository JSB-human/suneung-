import assert from "node:assert/strict";
import test from "node:test";
import { createRng } from "../../app/practice/rng.ts";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { MATH_GENERATORS } from "../../app/practice/generators/math.ts";

const LEVELS = [1, 2, 3];

function generate(skillId, seed, level) {
  return MATH_GENERATORS[skillId](createRng(seed), level);
}

test("ma-linear-eq satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-linear-eq", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-linear-eq answer actually solves the printed equation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-linear-eq", seed, 1);
    const match = question.prompt.match(/^(-?\d+)x ([+-]) (\d+) = (-?\d+)/);
    assert.ok(match, `unparseable prompt: ${question.prompt}`);
    const coefficient = Number(match[1]);
    const constant = match[2] === "-" ? -Number(match[3]) : Number(match[3]);
    const rightSide = Number(match[4]);
    const solution = Number(question.acceptableAnswers[0]);
    assert.equal(coefficient * solution + constant, rightSide, `seed ${seed}`);
  }
});

test("ma-linear-eq is deterministic for a given seed", () => {
  assert.deepEqual(generate("ma-linear-eq", 77, 2), generate("ma-linear-eq", 77, 2));
});

test("ma-linear-eq produces varied questions across seeds", () => {
  const prompts = new Set();
  for (let seed = 0; seed < 60; seed += 1) {
    prompts.add(generate("ma-linear-eq", seed, 1).prompt);
  }
  assert.ok(prompts.size > 40, `expected variety, got ${prompts.size} distinct prompts`);
});
