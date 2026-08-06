import assert from "node:assert/strict";
import test from "node:test";
import { createRng } from "../../app/practice/rng.ts";
import { buildChoices } from "../../app/practice/generators/choice-builder.ts";

test("builds four unique choices containing the correct answer once", () => {
  const rng = createRng(1);
  const choices = buildChoices(rng, "5", [
    { value: "7", mistakeTag: "sign-transpose" },
    { value: "15", mistakeTag: "no-divide" },
    { value: "-5", mistakeTag: "sign-flip" },
  ]);

  assert.equal(choices.length, 4);
  assert.equal(choices.filter((choice) => choice.value === "5").length, 1);
  assert.equal(new Set(choices.map((choice) => choice.value)).size, 4);
});

test("drops candidates that duplicate the correct answer", () => {
  const rng = createRng(2);
  const choices = buildChoices(rng, "5", [
    { value: "5", mistakeTag: "same-as-answer" },
    { value: "6", mistakeTag: "off-by-one" },
    { value: "7", mistakeTag: "other" },
    { value: "8", mistakeTag: "other" },
  ]);

  assert.equal(choices.length, 4);
  assert.equal(choices.filter((choice) => choice.value === "5").length, 1);
});

test("pads with numeric fallbacks when candidates run out", () => {
  const rng = createRng(3);
  const choices = buildChoices(rng, "5", [{ value: "6", mistakeTag: "off-by-one" }]);

  assert.equal(choices.length, 4);
  assert.equal(new Set(choices.map((choice) => choice.value)).size, 4);
});

test("the correct choice carries no mistakeTag", () => {
  const rng = createRng(4);
  const choices = buildChoices(rng, "5", [{ value: "6", mistakeTag: "off-by-one" }]);
  const correct = choices.find((choice) => choice.value === "5");
  assert.equal(correct.mistakeTag, undefined);
});

test("same seed yields the same order", () => {
  const candidates = [
    { value: "6", mistakeTag: "a" },
    { value: "7", mistakeTag: "b" },
    { value: "8", mistakeTag: "c" },
  ];
  const first = buildChoices(createRng(9), "5", candidates);
  const second = buildChoices(createRng(9), "5", candidates);
  assert.deepEqual(first, second);
});
