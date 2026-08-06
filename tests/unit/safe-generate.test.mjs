import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { generateSafely } from "../../app/practice/safe-generate.ts";

test("returns a valid question for a registered skill", () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const question = generateSafely("ma-linear-eq", 1);
    assert.ok(question, "expected a question");
    assert.deepEqual(findQuestionViolations(question), []);
  }
});

test("returns null instead of throwing for an unknown skill", () => {
  assert.equal(generateSafely("no-such-skill", 1), null);
});

test("accepts an explicit seed for reproducibility", () => {
  const first = generateSafely("ma-factor", 2, 4242);
  const second = generateSafely("ma-factor", 2, 4242);
  assert.deepEqual(first, second);
  assert.equal(first.seed, 4242);
});
