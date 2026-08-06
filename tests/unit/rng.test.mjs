import assert from "node:assert/strict";
import test from "node:test";
import { createRng, hashString } from "../../app/practice/rng.ts";

test("same seed produces the same sequence", () => {
  const first = createRng(12345);
  const second = createRng(12345);
  const a = Array.from({ length: 20 }, () => first.int(0, 1000));
  const b = Array.from({ length: 20 }, () => second.int(0, 1000));
  assert.deepEqual(a, b);
});

test("different seeds diverge", () => {
  const a = Array.from({ length: 20 }, (_, i) => createRng(1).int(0, 1000) + i * 0);
  const b = Array.from({ length: 20 }, (_, i) => createRng(2).int(0, 1000) + i * 0);
  assert.notDeepEqual(a, b);
});

test("int stays within bounds", () => {
  const rng = createRng(7);
  for (let i = 0; i < 2000; i += 1) {
    const value = rng.int(-5, 5);
    assert.ok(value >= -5 && value <= 5, `out of range: ${value}`);
    assert.ok(Number.isInteger(value), `not an integer: ${value}`);
  }
});

test("nonZeroInt never returns zero", () => {
  const rng = createRng(99);
  for (let i = 0; i < 2000; i += 1) {
    assert.notEqual(rng.nonZeroInt(-3, 3), 0);
  }
});

test("shuffle preserves the multiset", () => {
  const rng = createRng(42);
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const output = rng.shuffle(input);
  assert.deepEqual([...output].sort((x, y) => x - y), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8], "shuffle must not mutate its input");
});

test("pick returns a member of the list", () => {
  const rng = createRng(3);
  const items = ["a", "b", "c"];
  for (let i = 0; i < 200; i += 1) {
    assert.ok(items.includes(rng.pick(items)));
  }
});

test("hashString is deterministic and separates inputs", () => {
  assert.equal(hashString("2026-08-06"), hashString("2026-08-06"));
  assert.notEqual(hashString("2026-08-06"), hashString("2026-08-07"));
  assert.ok(Number.isInteger(hashString("x")) && hashString("x") >= 0);
});
