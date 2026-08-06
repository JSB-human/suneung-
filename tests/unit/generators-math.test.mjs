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

test("ma-poly-expand satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-poly-expand", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-poly-expand answer equals the product of the printed factors", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-poly-expand", seed, 2);
    const match = question.prompt.match(
      /^\((-?\d*)x ([+-]) (\d+)\)\((-?\d*)x ([+-]) (\d+)\)/,
    );
    assert.ok(match, `unparseable prompt: ${question.prompt}`);

    const readCoefficient = (raw) => (raw === "" ? 1 : raw === "-" ? -1 : Number(raw));
    const a = readCoefficient(match[1]);
    const b = match[2] === "-" ? -Number(match[3]) : Number(match[3]);
    const c = readCoefficient(match[4]);
    const d = match[5] === "-" ? -Number(match[6]) : Number(match[6]);

    const expected = expandToString(a * c, a * d + b * c, b * d);
    assert.equal(question.acceptableAnswers[0], expected, `seed ${seed}`);
  }
});

function expandToString(a, b, c) {
  const parts = [];
  if (a !== 0) {
    const body = Math.abs(a) === 1 ? "x^2" : `${Math.abs(a)}x^2`;
    parts.push(a < 0 ? `-${body}` : body);
  }
  if (b !== 0) {
    const body = Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`;
    parts.push(parts.length === 0 ? (b < 0 ? `-${body}` : body) : `${b < 0 ? "-" : "+"} ${body}`);
  }
  if (c !== 0) {
    parts.push(parts.length === 0 ? String(c) : `${c < 0 ? "-" : "+"} ${Math.abs(c)}`);
  }
  return parts.length === 0 ? "0" : parts.join(" ");
}
