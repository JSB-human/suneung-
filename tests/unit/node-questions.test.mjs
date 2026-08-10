import assert from "node:assert/strict";
import test from "node:test";
import { NODE_QUESTIONS } from "../../app/path/node-questions.ts";
import { resolveNodeContent } from "../../app/path/node-content.ts";
import { PATH_NODES, getNode, getNodesForSubject } from "../../app/path/path-nodes.ts";

const ALL_QUESTIONS = Object.values(NODE_QUESTIONS).flat();

test("every key in NODE_QUESTIONS is a real node id", () => {
  for (const nodeId of Object.keys(NODE_QUESTIONS)) {
    assert.ok(getNode(nodeId), `${nodeId} is not a path node id`);
  }
});

test("question ids are unique across the whole map", () => {
  const ids = ALL_QUESTIONS.map((question) => question.id);
  const seen = new Set();
  for (const id of ids) {
    assert.ok(!seen.has(id), `duplicate question id: ${id}`);
    seen.add(id);
  }
  assert.equal(seen.size, ids.length);
});

test("question ids do not collide with built-in question ids", () => {
  const authored = new Set(ALL_QUESTIONS.map((question) => question.id));
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    const builtInCount = content.questions.filter((question) => !authored.has(question.id)).length;
    const authoredCount = content.questions.length - builtInCount;
    assert.equal(
      authoredCount,
      (NODE_QUESTIONS[node.id] ?? []).length,
      `${node.id}: authored question ids overlap built-in ids`,
    );
  }
});

test("every question has exactly 4 distinct choices with one matching answer", () => {
  for (const [nodeId, questions] of Object.entries(NODE_QUESTIONS)) {
    for (const question of questions) {
      assert.equal(question.choices.length, 4, `${question.id} (${nodeId}) must have 4 choices`);
      const values = question.choices.map((choice) => choice.value);
      assert.equal(new Set(values).size, 4, `${question.id}: duplicate choice values`);
      const labels = question.choices.map((choice) => choice.label.trim());
      assert.equal(new Set(labels).size, 4, `${question.id}: duplicate choice labels`);
      for (const label of labels) {
        assert.ok(label.length > 0, `${question.id}: blank choice label`);
      }
      const correct = values.filter((value) => value === question.answer);
      assert.equal(correct.length, 1, `${question.id}: answer must match exactly one choice`);
    }
  }
});

test("prompts and explanations are written, not stubbed", () => {
  for (const question of ALL_QUESTIONS) {
    assert.ok(question.prompt.trim().length >= 10, `${question.id}: prompt too short`);
    const explanation = question.explanation.trim();
    assert.ok(explanation.length >= 25, `${question.id}: explanation too short (${explanation.length})`);
    assert.ok(
      !/^정답은\s*\d+\s*번/.test(explanation),
      `${question.id}: explanation must say why, not just name the option`,
    );
  }
});

test("every Korean and English node ends up with at least 3 check questions", () => {
  for (const subject of ["korean", "english"]) {
    for (const node of getNodesForSubject(subject)) {
      const content = resolveNodeContent(node.id);
      assert.ok(
        content.questions.length >= 3,
        `${node.id} has only ${content.questions.length} question(s)`,
      );
    }
  }
});

test("English nodes quote real English in at least one authored question", () => {
  for (const node of getNodesForSubject("english")) {
    const authored = NODE_QUESTIONS[node.id] ?? [];
    assert.ok(authored.length >= 2, `${node.id}: expected 2 authored questions`);
    const hasEnglish = authored.some((question) =>
      /[A-Za-z]{3,}[^가-힣]*\s+[A-Za-z]{2,}/.test(question.prompt),
    );
    assert.ok(hasEnglish, `${node.id}: no authored question quotes actual English`);
  }
});

test("authored questions are appended after the built-in question", () => {
  for (const [nodeId, questions] of Object.entries(NODE_QUESTIONS)) {
    const content = resolveNodeContent(nodeId);
    const tail = content.questions.slice(content.questions.length - questions.length);
    assert.deepEqual(
      tail.map((question) => question.id),
      questions.map((question) => question.id),
      `${nodeId}: authored questions are not in order at the end`,
    );
    assert.ok(
      content.questions.length > questions.length,
      `${nodeId}: built-in question was dropped`,
    );
  }
});

test("math nodes are unaffected", () => {
  const mathCounts = getNodesForSubject("math").map(
    (node) => resolveNodeContent(node.id).questions.length,
  );
  assert.equal(
    mathCounts.reduce((sum, count) => sum + count, 0),
    52,
    "math question total changed",
  );
});
