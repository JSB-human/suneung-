import assert from "node:assert/strict";
import test from "node:test";

import { FOUNDATION_REFERENCE } from "../../app/foundation-reference.ts";
import { FOUNDATION_LESSONS, findLesson } from "../../app/foundation-lessons.ts";

const CAPSULE_IDS = new Set(FOUNDATION_REFERENCE.map((capsule) => capsule.id));

/**
 * 이 강의문은 노베이스가 개념을 처음 배우는 유일한 통로다. 짧으면 요약과
 * 다를 게 없고, 예제가 없으면 읽고도 못 푼다. 그래서 분량과 구성을 재 둔다.
 */

test("모든 강의는 실제 캡슐에 붙는다", () => {
  for (const lesson of FOUNDATION_LESSONS) {
    assert.ok(
      CAPSULE_IDS.has(lesson.capsuleId),
      `${lesson.capsuleId}: 이런 캡슐이 없다. 붙을 곳 없는 강의는 화면에 나오지 않는다`,
    );
  }
});

test("한 캡슐에 강의는 하나뿐이다", () => {
  const seen = new Set();
  for (const lesson of FOUNDATION_LESSONS) {
    assert.ok(!seen.has(lesson.capsuleId), `${lesson.capsuleId}: 강의가 두 개다`);
    seen.add(lesson.capsuleId);
  }
});

test("강의는 요약보다 깊다", () => {
  for (const lesson of FOUNDATION_LESSONS) {
    const id = lesson.capsuleId;
    assert.ok(lesson.hook.trim().length >= 15, `${id}: hook이 너무 짧다`);
    assert.ok(
      lesson.sections.length >= 3 && lesson.sections.length <= 6,
      `${id}: 덩어리가 ${lesson.sections.length}개다. 3~6개여야 읽을 만하다`,
    );

    const headings = new Set();
    for (const section of lesson.sections) {
      assert.ok(section.heading.trim().length > 0, `${id}: 제목이 빈 덩어리가 있다`);
      assert.ok(!headings.has(section.heading), `${id}: 제목이 겹친다 — ${section.heading}`);
      headings.add(section.heading);
      // 빈 껍데기 덩어리만 막는다. 덩어리마다 길이를 요구하면 예제가 지고
      // 가는 덩어리나 일부러 짧게 끝내는 마무리에서 군말을 넣게 된다 —
      // 실제로 이 규칙의 앞 버전이 그 둘을 다 잡아서 고쳤다.
      assert.ok(
        section.body.trim().length >= 40,
        `${id} / ${section.heading}: 본문이 ${section.body.trim().length}자다. 덩어리라 부를 수 없다`,
      );
    }

    // 깊이는 덩어리 하나가 아니라 강의 전체로 잰다.
    const total = lesson.sections.reduce((sum, section) => sum + section.body.length, 0);
    assert.ok(total >= 600, `${id}: 전체 ${total}자. 문제집 수준이라 부르기 어렵다`);

    // 그렇다고 짧은 덩어리만 늘어놓으면 안 된다. 제대로 설명하는 덩어리가
    // 최소 셋은 있어야 요약을 쪼개 놓은 것과 구별된다.
    const substantial = lesson.sections.filter((s) => s.body.trim().length >= 120);
    assert.ok(
      substantial.length >= 3,
      `${id}: 120자 넘는 덩어리가 ${substantial.length}개뿐이다. 요약을 쪼개 놓은 것과 다를 게 없다`,
    );
  }
});

test("모든 강의에 끝까지 푸는 예제가 하나는 있다", () => {
  for (const lesson of FOUNDATION_LESSONS) {
    const examples = lesson.sections.filter((section) => section.example);
    assert.ok(
      examples.length >= 1,
      `${lesson.capsuleId}: 예제가 없다. 설명만 읽고 풀 수 있는 사람은 이미 아는 사람이다`,
    );
    for (const section of examples) {
      const example = section.example;
      assert.ok(example.question.trim().length > 0, `${lesson.capsuleId}: 예제 문제가 비었다`);
      assert.ok(
        example.steps.length >= 2,
        `${lesson.capsuleId}: 풀이가 ${example.steps.length}단계다. 그건 답만 알려 주는 것이다`,
      );
      assert.ok(example.answer.trim().length > 0, `${lesson.capsuleId}: 예제 답이 비었다`);
    }
  }
});

test("findLesson은 캡슐 id로 강의를 찾는다", () => {
  for (const lesson of FOUNDATION_LESSONS) {
    assert.equal(findLesson(lesson.capsuleId)?.capsuleId, lesson.capsuleId);
  }
  assert.equal(findLesson("없는-캡슐"), undefined);
});
