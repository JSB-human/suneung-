import assert from "node:assert/strict";
import test from "node:test";
import { generateQuestion } from "../../app/practice/generators/registry.ts";
import { gradeAnswer, mapOutcomeToRating, normaliseAnswer } from "../../app/practice/grading.ts";

test("normaliseAnswer trims and collapses whitespace", () => {
  assert.equal(normaliseAnswer("  5  "), "5");
  assert.equal(normaliseAnswer("(x + 3)(x + 4)"), "(x+3)(x+4)");
  assert.equal(normaliseAnswer("x  =  2 또는  x = 3"), "x=2또는x=3");
});

test("gradeAnswer accepts the correct answer regardless of spacing", () => {
  const question = generateQuestion("ma-factor", 5, 2);
  const spaced = question.acceptableAnswers[0].replace(/\(/g, " ( ");
  assert.equal(gradeAnswer(question, spaced).isCorrect, true);
});

test("gradeAnswer reports the mistakeTag of the chosen wrong option", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  const wrong = question.choices.find((choice) => choice.mistakeTag);
  const result = gradeAnswer(question, wrong.value);
  assert.equal(result.isCorrect, false);
  assert.equal(result.mistakeTag, wrong.mistakeTag);
});

test("gradeAnswer returns a null mistakeTag for unrecognised input", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  const result = gradeAnswer(question, "완전히 엉뚱한 답");
  assert.equal(result.isCorrect, false);
  assert.equal(result.mistakeTag, null);
});

test("an empty submission is never correct", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  assert.equal(gradeAnswer(question, "   ").isCorrect, false);
});

test("mapOutcomeToRating follows the spec table", () => {
  assert.equal(mapOutcomeToRating({ isCorrect: false, hintsUsed: 0, elapsedSeconds: 5, targetSeconds: 50 }), "again");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 2, elapsedSeconds: 5, targetSeconds: 50 }), "hard");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 20, targetSeconds: 50 }), "easy");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 45, targetSeconds: 50 }), "good");
});

test("mapOutcomeToRating treats a wrong answer as again even when fast", () => {
  assert.equal(mapOutcomeToRating({ isCorrect: false, hintsUsed: 0, elapsedSeconds: 1, targetSeconds: 50 }), "again");
});
