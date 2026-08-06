import assert from "node:assert/strict";
import test from "node:test";
import { listSkillIds } from "../../app/practice/generators/registry.ts";
import { resolveConceptSource } from "../../app/practice/concept-source.ts";

test("every registered skill resolves to a concept source", () => {
  for (const skillId of listSkillIds()) {
    const source = resolveConceptSource(skillId);
    assert.ok(source, `no concept source for ${skillId}`);
    assert.ok(source.title.trim(), `${skillId} has no title`);
    assert.ok(source.keyPoints.length > 0, `${skillId} has no key points`);
  }
});

test("resolveConceptSource returns null for an unknown skill", () => {
  assert.equal(resolveConceptSource("no-such-skill"), null);
});

test("the linear equation skill surfaces its formula from the core note", () => {
  const source = resolveConceptSource("ma-linear-eq");
  assert.equal(source.title, "일차방정식");
  assert.ok(source.formula?.includes("ax+b=c"));
  assert.ok(source.mistake.trim());
});

test("key points come from the core note essentials", () => {
  const source = resolveConceptSource("ma-factor");
  assert.ok(source.keyPoints.includes("공통인수 묶기"));
});

test("the concept sheet never shows a worked example about a different operation", () => {
  const forbidden = {
    "ma-linear-eq": /인수분해|이차|x²|\^2/,
    "ma-poly-expand": /인수분해하면/,
    "ma-frac-arith": /인수분해|이차방정식/,
  };

  for (const [skillId, pattern] of Object.entries(forbidden)) {
    const source = resolveConceptSource(skillId);
    const example = source.workedExample?.prompt ?? "";
    assert.ok(
      !pattern.test(example),
      `${skillId} shows an off-topic worked example: ${example}`,
    );
  }
});

test("skills backed by a core note surface its microPractice", () => {
  for (const skillId of ["ma-linear-eq", "ma-factor", "ma-frac-arith"]) {
    const source = resolveConceptSource(skillId);
    assert.ok(source.microPractice?.trim(), `${skillId} has no microPractice`);
  }
});

test("only skills whose capsule example matches the skill borrow it", () => {
  // 캡슐 예제를 켠 스킬은 예제가 있어야 하고, 끈 스킬은 없어야 한다.
  assert.ok(resolveConceptSource("ma-factor").workedExample?.prompt.includes("인수분해"));
  assert.ok(resolveConceptSource("ma-quad-eq").workedExample?.prompt.includes("=0"));

  for (const skillId of ["ma-linear-eq", "ma-poly-expand", "ma-frac-arith"]) {
    assert.equal(
      resolveConceptSource(skillId).workedExample,
      undefined,
      `${skillId} must not borrow the broader capsule's example`,
    );
  }
});
