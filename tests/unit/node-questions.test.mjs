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

// 설계 기준은 칸마다 확인 문제 3개다. 국어·영어·수학을 따로 세지 않고 한 번에 확인한다.
// 예외는 생성기(skillId)가 붙은 칸뿐이다. 그 칸은 런타임에 문제를 무한히 만들어 내므로
// 고정 문항을 3개까지 채워 둘 필요가 없다.
test("every node reaches 3 check questions unless a generator backs it", () => {
  const short = [];
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    if (content.skillId) {
      continue;
    }
    if (content.questions.length < 3) {
      short.push(`${node.id} (${content.questions.length})`);
    }
  }
  assert.deepEqual(short, [], `칸당 3문항을 채우지 못한 노드: ${short.join(", ")}`);
});

const QUOTES_ENGLISH = /[A-Za-z]{3,}[^가-힣]*\s+[A-Za-z]{2,}/;

// 유형 칸은 추가 문항 대신 자기 문항 3개를 직접 들고 있으므로 NODE_QUESTIONS에 없다.
test("English knowledge nodes quote real English in at least one authored question", () => {
  for (const node of getNodesForSubject("english")) {
    if (node.kind === "pattern") {
      continue;
    }
    const authored = NODE_QUESTIONS[node.id] ?? [];
    assert.ok(authored.length >= 2, `${node.id}: expected 2 authored questions`);
    const hasEnglish = authored.some((question) => QUOTES_ENGLISH.test(question.prompt));
    assert.ok(hasEnglish, `${node.id}: no authored question quotes actual English`);
  }
});

// 영어 유형 칸은 한국어 설명만 읽고 끝나면 안 된다. 실제 영어 문장을 만나야 한다.
test("English pattern nodes quote real English in their own questions", () => {
  for (const node of getNodesForSubject("english")) {
    if (node.kind !== "pattern") {
      continue;
    }
    const questions = resolveNodeContent(node.id).questions;
    const quoting = questions.filter(
      (question) =>
        QUOTES_ENGLISH.test(question.prompt) ||
        question.choices.some((choice) => QUOTES_ENGLISH.test(choice.label)),
    );
    assert.ok(quoting.length >= 2, `${node.id}: 영어를 인용한 문항이 ${quoting.length}개뿐이다`);
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

// 생성기 칸 3개는 quickCheck 1문항만 고정으로 들고 있으므로 합계가 22×3이 되지 않는다.
// 12개 개념 칸(3) + 7개 캡슐 칸(3) + 3개 생성기 캡슐 칸(1) = 60.
// 유형 칸은 뒤에 계속 붙으므로 개념·캡슐 칸만 세고, 유형 칸은 따로 3문항씩인지 본다.
test("math concept and capsule nodes carry 60 fixed questions in total", () => {
  const mathCounts = getNodesForSubject("math")
    .filter((node) => node.kind !== "pattern")
    .map((node) => resolveNodeContent(node.id).questions.length);
  assert.equal(
    mathCounts.reduce((sum, count) => sum + count, 0),
    60,
    "math question total changed",
  );
});

test("every math pattern node carries enough fixed questions", () => {
  // 원래 "정확히 3개"였다. 그런데 3문항은 형식을 채울 뿐 유형을 익히기에는
  // 모자라서, 운이나 한 예의 패턴 맞추기로 셋 다 맞힐 수 있다. 숫자를 3으로
  // 못 박으면 문항을 늘리는 개선 자체가 테스트를 깨뜨린다.
  //
  // 지켜야 할 것은 "3개"가 아니라 "빈약한 칸이 없다"이므로 하한으로 바꾼다.
  const MIN_QUESTIONS = 3;
  const patterns = getNodesForSubject("math").filter((node) => node.kind === "pattern");
  assert.ok(patterns.length > 0, "수학 유형 칸이 하나도 없다");
  for (const node of patterns) {
    const count = resolveNodeContent(node.id).questions.length;
    assert.ok(
      count >= MIN_QUESTIONS,
      `${node.id}: 확인 문제가 ${count}개뿐이다 (최소 ${MIN_QUESTIONS}개)`,
    );
  }
});
