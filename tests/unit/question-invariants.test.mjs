import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";

function validQuestion(overrides = {}) {
  return {
    skillId: "ma-linear-eq",
    seed: 1,
    level: 1,
    prompt: "3x + 4 = 19 일 때, x의 값은?",
    inputLabel: "x의 값",
    choices: [
      { value: "5", label: "5" },
      { value: "7", label: "7", mistakeTag: "sign-transpose" },
      { value: "15", label: "15", mistakeTag: "no-divide" },
      { value: "-5", label: "-5", mistakeTag: "sign-flip" },
    ],
    acceptableAnswers: ["5"],
    steps: ["양변에서 4를 빼면 3x = 15", "양변을 3으로 나누면 x = 5"],
    hints: ["일차방정식이야", "이항하면 부호가 바뀌어", "먼저 3x = 15 를 만들어 봐"],
    ...overrides,
  };
}

test("a well-formed question has no violations", () => {
  assert.deepEqual(findQuestionViolations(validQuestion()), []);
});

test("empty prompt is a violation", () => {
  assert.ok(findQuestionViolations(validQuestion({ prompt: "   " })).some((v) => v.includes("prompt")));
});

test("missing steps is a violation", () => {
  assert.ok(findQuestionViolations(validQuestion({ steps: [] })).some((v) => v.includes("steps")));
});

test("hints must be exactly three non-empty entries", () => {
  assert.ok(findQuestionViolations(validQuestion({ hints: ["a", "b"] })).some((v) => v.includes("hints")));
  assert.ok(findQuestionViolations(validQuestion({ hints: ["a", "b", " "] })).some((v) => v.includes("hints")));
});

test("duplicate choice values are a violation", () => {
  const question = validQuestion();
  question.choices[1] = { value: "5", label: "5" };
  assert.ok(findQuestionViolations(question).some((v) => v.includes("duplicate")));
});

test("exactly one choice must be correct", () => {
  const noneCorrect = validQuestion({ acceptableAnswers: ["999"] });
  assert.ok(findQuestionViolations(noneCorrect).some((v) => v.includes("exactly one")));
});

test("fewer than three choices is a violation", () => {
  const question = validQuestion();
  question.choices = question.choices.slice(0, 2);
  assert.ok(findQuestionViolations(question).some((v) => v.includes("at least 3")));
});

test("input-only questions without choices are allowed", () => {
  const question = validQuestion();
  delete question.choices;
  assert.deepEqual(findQuestionViolations(question), []);
});
