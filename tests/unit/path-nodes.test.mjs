import assert from "node:assert/strict";
import test from "node:test";
import { FOUNDATION_REFERENCE } from "../../app/foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../../app/language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../../app/math-curriculum.ts";
import { PATH_NODES, getNode, getNodesForSubject } from "../../app/path/path-nodes.ts";

const SUBJECTS = ["korean", "english", "math"];

test("node ids are unique", () => {
  const ids = PATH_NODES.map((node) => node.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("capsules come before concepts within a subject", () => {
  for (const subject of SUBJECTS) {
    const nodes = getNodesForSubject(subject);
    const firstConcept = nodes.findIndex((node) => node.kind === "concept");
    const lastCapsule = nodes.map((node) => node.kind).lastIndexOf("capsule");
    assert.ok(lastCapsule < firstConcept, `${subject}: capsules and concepts interleave`);
  }
});

test("order runs 1..n with no gaps per subject", () => {
  for (const subject of SUBJECTS) {
    const orders = getNodesForSubject(subject).map((node) => node.order);
    assert.deepEqual(orders, orders.map((_, index) => index + 1), `${subject} order has gaps`);
  }
});

test("every capsule and every concept appears exactly once", () => {
  const sourceIds = new Set(PATH_NODES.map((node) => node.sourceId));

  for (const capsule of FOUNDATION_REFERENCE) {
    assert.ok(sourceIds.has(capsule.id), `capsule missing from path: ${capsule.id}`);
  }

  for (const subject of ["korean", "english"]) {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          assert.ok(sourceIds.has(concept.id), `concept missing from path: ${concept.id}`);
        }
      }
    }
  }

  for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
    for (const unit of chapter.units) {
      for (const concept of unit.concepts) {
        assert.ok(sourceIds.has(concept.id), `math concept missing from path: ${concept.id}`);
      }
    }
  }
});

test("subject node counts match the measured content", () => {
  assert.equal(getNodesForSubject("korean").length, 31);
  assert.equal(getNodesForSubject("english").length, 31);
  assert.equal(getNodesForSubject("math").length, 22);
  assert.equal(PATH_NODES.length, 84);
});

test("every node has a non-empty title and summary", () => {
  for (const node of PATH_NODES) {
    assert.ok(node.title.trim(), `${node.id} has no title`);
    assert.ok(node.summary.trim(), `${node.id} has no summary`);
  }
});

test("getNode finds by id and returns null otherwise", () => {
  assert.equal(getNode(PATH_NODES[0].id)?.id, PATH_NODES[0].id);
  assert.equal(getNode("no-such-node"), null);
});

test("math nodes that have a generator carry its skillId", () => {
  const withSkill = PATH_NODES.filter((node) => node.skillId);
  assert.ok(withSkill.length >= 5, `expected at least 5 generator-backed nodes, got ${withSkill.length}`);
  for (const node of withSkill) {
    assert.equal(node.subject, "math");
  }
});

test("english capsules teach words and sentence shape before listening strategy", () => {
  const capsules = getNodesForSubject("english").filter((node) => node.kind === "capsule");
  const orderOf = (sourceId) => capsules.findIndex((node) => node.sourceId === sourceId);

  assert.ok(orderOf("en-vocabulary") < orderOf("en-listening-preview"), "단어가 듣기 전략보다 먼저여야 한다");
  assert.ok(orderOf("en-sv-skeleton") < orderOf("en-listening-preview"), "문장 뼈대가 듣기 전략보다 먼저여야 한다");
  assert.equal(capsules[0].sourceId, "en-vocabulary");
  assert.equal(capsules[1].sourceId, "en-sv-skeleton");
});

test("an explicit capsule order does not drop or duplicate any capsule", () => {
  for (const subject of ["korean", "english", "math"]) {
    const capsules = getNodesForSubject(subject).filter((node) => node.kind === "capsule");
    const ids = capsules.map((node) => node.sourceId);
    assert.equal(new Set(ids).size, ids.length, `${subject}: duplicate capsule`);
  }
});

test("pattern nodes come after every concept node in a subject", () => {
  // 개념을 모르는 상태에서 유형을 보면 못 푼다. 순서가 뒤집히면 안 된다.
  for (const subject of SUBJECTS) {
    const nodes = getNodesForSubject(subject);
    const lastConcept = nodes.map((node) => node.kind).lastIndexOf("concept");
    const firstPattern = nodes.findIndex((node) => node.kind === "pattern");
    if (firstPattern === -1) continue;
    assert.ok(lastConcept < firstPattern, `${subject}: 유형 칸이 개념 칸보다 앞에 있다`);
  }
});

test("every pattern node resolves to content with three check questions", () => {
  for (const node of PATH_NODES.filter((item) => item.kind === "pattern")) {
    const content = resolveNodeContent(node.id);
    assert.ok(content, `${node.id}: 내용을 못 불러온다`);
    assert.ok(content.explanation.trim(), `${node.id}: 설명이 비었다`);
    assert.equal(content.keyPoints.length, 3, `${node.id}: 먼저 볼 것이 3개여야 한다`);
    assert.ok(content.mistake?.trim(), `${node.id}: 자주 하는 실수가 비었다`);
    assert.ok(content.questions.length >= 3, `${node.id}: 확인 문제가 3개 미만`);
  }
});
