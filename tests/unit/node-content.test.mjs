import assert from "node:assert/strict";
import test from "node:test";
import { createRng, hashString } from "../../app/practice/rng.ts";
import { PATH_NODES } from "../../app/path/path-nodes.ts";
import { resolveNodeContent } from "../../app/path/node-content.ts";

test("every node resolves to content with an explanation", () => {
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    assert.ok(content, `no content for ${node.id}`);
    assert.ok(content.explanation.trim(), `${node.id} has no explanation`);
    assert.ok(content.title.trim(), `${node.id} has no title`);
  }
});

test("every node offers at least one check question", () => {
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    const hasFixed = content.questions.length > 0;
    const hasGenerator = Boolean(content.skillId);
    assert.ok(hasFixed || hasGenerator, `${node.id} has no way to ask a question`);
  }
});

test("fixed questions are well formed", () => {
  for (const node of PATH_NODES) {
    for (const question of resolveNodeContent(node.id).questions) {
      assert.ok(question.prompt.trim(), `${node.id}: blank prompt`);
      assert.ok(question.explanation.trim(), `${node.id}: blank explanation`);
      if (question.choices.length > 0) {
        assert.ok(question.choices.length >= 2, `${node.id}: too few choices`);
        const correct = question.choices.filter((choice) => choice.value === question.answer);
        assert.equal(correct.length, 1, `${node.id}: answer must match exactly one choice`);
        const values = question.choices.map((choice) => choice.value);
        assert.equal(new Set(values).size, values.length, `${node.id}: duplicate choices`);
      }
    }
  }
});

test("resolveNodeContent returns null for an unknown node", () => {
  assert.equal(resolveNodeContent("no-such-node"), null);
});

test("nodes with a formula mapping expose formula text", () => {
  const withFormula = PATH_NODES.filter((node) => node.formulaNoteId);
  assert.ok(withFormula.length >= 20);
  for (const node of withFormula) {
    const content = resolveNodeContent(node.id);
    assert.ok(content.keyPoints.length > 0, `${node.id} has a note but no key points`);
  }
});

test("every node surfaces at least one study link", () => {
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    assert.ok(content.links.length > 0, `${node.id} has no links`);
  }
});

test("every link has a title and an https href", () => {
  for (const node of PATH_NODES) {
    for (const link of resolveNodeContent(node.id).links) {
      assert.ok(link.title.trim(), `${node.id}: link without a title`);
      assert.match(link.href, /^https:\/\//, `${node.id}: ${link.href} is not https`);
    }
  }
});

test("a node never lists the same link twice", () => {
  for (const node of PATH_NODES) {
    const hrefs = resolveNodeContent(node.id).links.map((link) => link.href);
    assert.equal(new Set(hrefs).size, hrefs.length, `${node.id} repeats a link`);
  }
});

test("concept nodes put their own resources before the subject-wide ones", () => {
  // 개념에 딸린 자료가 과목 전체 링크보다 정확하므로 먼저 나와야 한다.
  const content = resolveNodeContent("concept:linear-equations");
  assert.ok(content.links.length > 2, "expected concept resources on top of the subject links");
  assert.doesNotMatch(content.links[0].note ?? "", /^EBSi 공식 강좌$/);
});

test("shuffling choices for a retry keeps the same set and one correct answer", () => {
  // 다시 풀 때 선지 자리만 바뀌어야 한다. 선지가 빠지거나 늘면 안 된다.
  for (const node of PATH_NODES) {
    for (const question of resolveNodeContent(node.id).questions) {
      if (question.choices.length === 0) continue;
      for (const round of [1, 2, 3]) {
        const shuffled = createRng(hashString(`${question.id}:${round}`)).shuffle(question.choices);
        assert.equal(shuffled.length, question.choices.length, `${question.id}: 선지 수가 바뀌었다`);
        assert.deepEqual(
          [...shuffled].map((c) => c.value).sort(),
          [...question.choices].map((c) => c.value).sort(),
          `${question.id}: 선지 구성이 바뀌었다`,
        );
        assert.equal(
          shuffled.filter((c) => c.value === question.answer).length,
          1,
          `${question.id}: 정답이 정확히 하나여야 한다`,
        );
      }
    }
  }
});
