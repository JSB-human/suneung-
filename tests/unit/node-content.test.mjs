import assert from "node:assert/strict";
import test from "node:test";
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
