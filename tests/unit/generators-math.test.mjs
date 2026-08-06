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

test("ma-factor satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-factor", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-factor answer expands back to the printed polynomial", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-factor", seed, 2);

    const promptMatch = question.prompt.match(/^x\^2 ([+-]) (\d*)x ([+-]) (\d+)/);
    assert.ok(promptMatch, `unparseable prompt: ${question.prompt}`);
    const middleMagnitude = promptMatch[2] === "" ? 1 : Number(promptMatch[2]);
    const middle = promptMatch[1] === "-" ? -middleMagnitude : middleMagnitude;
    const constant = promptMatch[3] === "-" ? -Number(promptMatch[4]) : Number(promptMatch[4]);

    const answerMatch = question.acceptableAnswers[0].match(
      /^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/,
    );
    assert.ok(answerMatch, `unparseable answer: ${question.acceptableAnswers[0]}`);
    const rootA = answerMatch[1] === "-" ? -Number(answerMatch[2]) : Number(answerMatch[2]);
    const rootB = answerMatch[3] === "-" ? -Number(answerMatch[4]) : Number(answerMatch[4]);

    assert.equal(rootA + rootB, middle, `seed ${seed}: middle term mismatch`);
    assert.equal(rootA * rootB, constant, `seed ${seed}: constant term mismatch`);
  }
});

test("ma-factor orders the two factors consistently", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const answer = generate("ma-factor", seed, 2).acceptableAnswers[0];
    const match = answer.match(/^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/);
    const first = match[1] === "-" ? -Number(match[2]) : Number(match[2]);
    const second = match[3] === "-" ? -Number(match[4]) : Number(match[4]);
    assert.ok(first <= second, `factors not sorted for seed ${seed}: ${answer}`);
  }
});

test("ma-factor never offers two mathematically identical choices", () => {
  const expand = (answer) => {
    const match = answer.match(/^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/);
    const first = match[1] === "-" ? -Number(match[2]) : Number(match[2]);
    const second = match[3] === "-" ? -Number(match[4]) : Number(match[4]);
    return `${first + second},${first * second}`;
  };

  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-factor", seed, level);
      const expanded = question.choices.map((choice) => expand(choice.value));
      assert.equal(
        new Set(expanded).size,
        expanded.length,
        `seed ${seed} level ${level} has duplicate-valued choices: ${question.choices.map((c) => c.value).join(" / ")}`,
      );
    }
  }
});

test("ma-factor never emits a repeated root", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const answer = generate("ma-factor", seed, level).acceptableAnswers[0];
      const match = answer.match(/^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/);
      const first = match[1] === "-" ? -Number(match[2]) : Number(match[2]);
      const second = match[3] === "-" ? -Number(match[4]) : Number(match[4]);
      assert.notEqual(first, second, `seed ${seed} level ${level}: repeated root in ${answer}`);
    }
  }
});

test("ma-quad-eq satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-quad-eq", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-quad-eq roots satisfy the printed equation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-quad-eq", seed, 2);

    const promptMatch = question.prompt.match(/^x\^2 ([+-]) (\d*)x ([+-]) (\d+) = 0/);
    assert.ok(promptMatch, `unparseable prompt: ${question.prompt}`);
    const bMagnitude = promptMatch[2] === "" ? 1 : Number(promptMatch[2]);
    const b = promptMatch[1] === "-" ? -bMagnitude : bMagnitude;
    const c = promptMatch[3] === "-" ? -Number(promptMatch[4]) : Number(promptMatch[4]);

    const rootMatches = [...question.acceptableAnswers[0].matchAll(/x = (-?\d+)/g)];
    assert.equal(rootMatches.length, 2, `expected two roots: ${question.acceptableAnswers[0]}`);

    for (const rootMatch of rootMatches) {
      const root = Number(rootMatch[1]);
      assert.equal(root * root + b * root + c, 0, `seed ${seed}: ${root} is not a root`);
    }
  }
});

test("ma-frac-arith satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-frac-arith", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-frac-arith answer matches an independent exact computation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-frac-arith", seed, 2);
    const match = question.prompt.match(/^(\d+)\/(\d+) ([+\-×÷]) (\d+)\/(\d+)/);
    assert.ok(match, `unparseable prompt: ${question.prompt}`);

    const a = Number(match[1]);
    const b = Number(match[2]);
    const operator = match[3];
    const c = Number(match[4]);
    const d = Number(match[5]);

    let numerator;
    let denominator;
    if (operator === "+") {
      numerator = a * d + c * b;
      denominator = b * d;
    } else if (operator === "-") {
      numerator = a * d - c * b;
      denominator = b * d;
    } else if (operator === "×") {
      numerator = a * c;
      denominator = b * d;
    } else {
      numerator = a * d;
      denominator = b * c;
    }

    const divide = (x, y) => {
      let p = Math.abs(x);
      let q = Math.abs(y);
      while (q !== 0) {
        const r = p % q;
        p = q;
        q = r;
      }
      return p === 0 ? 1 : p;
    };

    const sign = denominator < 0 ? -1 : 1;
    const common = divide(numerator, denominator);
    const reducedNumerator = numerator === 0 ? 0 : (sign * numerator) / common;
    const reducedDenominator = numerator === 0 ? 1 : (sign * denominator) / common;
    const expected =
      reducedDenominator === 1 ? String(reducedNumerator) : `${reducedNumerator}/${reducedDenominator}`;

    assert.equal(question.acceptableAnswers[0], expected, `seed ${seed}: ${question.prompt}`);
  }
});

test("ma-frac-arith level 1 uses only addition and subtraction", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const question = generate("ma-frac-arith", seed, 1);
    assert.ok(/[+\-]/.test(question.prompt), question.prompt);
    assert.ok(!/[×÷]/.test(question.prompt), `level 1 must not use × or ÷: ${question.prompt}`);
  }
});

test("ma-frac-arith level 1 uses only proper fractions", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-frac-arith", seed, 1);
    const match = question.prompt.match(/^(\d+)\/(\d+) ([+\-×÷]) (\d+)\/(\d+)/);
    assert.ok(match, `unparseable prompt: ${question.prompt}`);
    assert.ok(Number(match[1]) < Number(match[2]), `improper first fraction: ${question.prompt}`);
    assert.ok(Number(match[4]) < Number(match[5]), `improper second fraction: ${question.prompt}`);
  }
});

// A choice "decorates" the answer when it keeps the whole answer as a prefix and
// then adds only cosmetic noise. A remainder that starts with an alphanumeric
// character continues the last token, so it changes the value ("x^2 - 4x + 4"
// against "x^2 - 4", or "10" against "1"); a remainder that starts with an
// operator introduces a real new term ("5/2" against "5"). Anything else — a
// space, a bracket, a suffix label — leaves the answer intact and is decoration.
function decoratesAnswer(value, answer) {
  if (value === answer || !value.startsWith(answer)) {
    return false;
  }
  const remainder = value.slice(answer.length);
  return !/^[0-9a-zA-Z]/.test(remainder) && !/^\s*[+\-×÷/^]/.test(remainder);
}

test("no generator ever offers a choice that merely decorates the correct answer", () => {
  for (const skillId of ["ma-linear-eq", "ma-poly-expand", "ma-factor", "ma-quad-eq", "ma-frac-arith"]) {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 300; seed += 1) {
        const question = generate(skillId, seed, level);
        const answer = question.acceptableAnswers[0];
        for (const choice of question.choices) {
          assert.ok(
            !decoratesAnswer(choice.value, answer),
            `${skillId} seed ${seed} level ${level}: decorated answer choice "${choice.value}" against answer "${answer}"`,
          );
        }
      }
    }
  }
});

test("ma-poly-expand never offers two mathematically identical choices", () => {
  const parseQuadratic = (value) => {
    const normalised = value.replace(/\s+/g, "");
    const match = normalised.match(
      /^(-?\d*)x\^2(?:([+-])(\d*)x)?(?:([+-])(\d+))?$/,
    );
    assert.ok(match, `unparseable quadratic: ${value}`);
    const readLead = (raw) => (raw === "" ? 1 : raw === "-" ? -1 : Number(raw));
    const a = readLead(match[1]);
    const b = match[2] ? (match[2] === "-" ? -1 : 1) * (match[3] === "" ? 1 : Number(match[3])) : 0;
    const c = match[4] ? (match[4] === "-" ? -1 : 1) * Number(match[5]) : 0;
    return `${a},${b},${c}`;
  };

  for (const level of LEVELS) {
    for (let seed = 0; seed < 300; seed += 1) {
      const question = generate("ma-poly-expand", seed, level);
      const parsed = question.choices.map((choice) => parseQuadratic(choice.value));
      assert.equal(
        new Set(parsed).size,
        parsed.length,
        `seed ${seed} level ${level} has duplicate-valued choices: ${question.choices.map((c) => c.value).join(" / ")}`,
      );
    }
  }
});

test("ma-poly-expand still offers four choices for difference-of-squares questions", () => {
  let differenceOfSquaresSeen = 0;
  for (const level of LEVELS) {
    for (let seed = 0; seed < 300; seed += 1) {
      const question = generate("ma-poly-expand", seed, level);
      if (/^x\^2 [+-] \d+$/.test(question.acceptableAnswers[0])) {
        differenceOfSquaresSeen += 1;
        assert.equal(
          question.choices.length,
          4,
          `seed ${seed} level ${level}: ${question.choices.map((c) => c.value).join(" / ")}`,
        );
      }
    }
  }
  assert.ok(differenceOfSquaresSeen > 0, "expected to encounter difference-of-squares cases");
});
