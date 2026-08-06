import assert from "node:assert/strict";
import test from "node:test";
import {
  formatFactor,
  formatFraction,
  formatQuadratic,
  gcd,
  lcm,
  reduceFraction,
} from "../../app/practice/math-format.ts";

test("gcd handles negatives and zero", () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(-12, 18), 6);
  assert.equal(gcd(7, 0), 7);
  assert.equal(gcd(0, 0), 1);
});

test("lcm computes the least common multiple", () => {
  assert.equal(lcm(2, 8), 8);
  assert.equal(lcm(3, 4), 12);
  assert.equal(lcm(6, 9), 18);
  assert.equal(lcm(5, 5), 5);
});

test("reduceFraction reduces and normalises sign to the numerator", () => {
  assert.deepEqual(reduceFraction(6, 8), { numerator: 3, denominator: 4 });
  assert.deepEqual(reduceFraction(3, -4), { numerator: -3, denominator: 4 });
  assert.deepEqual(reduceFraction(-6, -8), { numerator: 3, denominator: 4 });
  assert.deepEqual(reduceFraction(0, 5), { numerator: 0, denominator: 1 });
});

test("formatFraction hides denominator 1", () => {
  assert.equal(formatFraction({ numerator: 3, denominator: 4 }), "3/4");
  assert.equal(formatFraction({ numerator: 5, denominator: 1 }), "5");
  assert.equal(formatFraction({ numerator: -3, denominator: 4 }), "-3/4");
});

test("formatQuadratic renders readable polynomials", () => {
  assert.equal(formatQuadratic(1, 7, 12), "x^2 + 7x + 12");
  assert.equal(formatQuadratic(1, -2, -15), "x^2 - 2x - 15");
  assert.equal(formatQuadratic(2, -5, -12), "2x^2 - 5x - 12");
  assert.equal(formatQuadratic(1, 0, -9), "x^2 - 9");
  assert.equal(formatQuadratic(1, -1, 0), "x^2 - x");
  assert.equal(formatQuadratic(-1, 3, 0), "-x^2 + 3x");
  assert.equal(formatQuadratic(0, 0, 0), "0");
});

test("formatFactor renders (x + a) form", () => {
  assert.equal(formatFactor(3), "(x + 3)");
  assert.equal(formatFactor(-4), "(x - 4)");
});
