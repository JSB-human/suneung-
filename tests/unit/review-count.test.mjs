import assert from "node:assert/strict";
import test from "node:test";

import { VOCAB_WORDS } from "../../app/vocab-data.ts";
import { addDays } from "../../app/practice/review-queue.ts";

/**
 * 기록 탭의 "오늘 복습 N개"를 세는 규칙.
 *
 * 이 규칙이 한 번 틀린 적이 있다. 진행 기록이 없는 단어를 복습 대상으로 세는
 * 바람에, 아무것도 안 한 첫날 사용자에게 "오늘 복습 1500개"라고 말했다.
 * 바로 옆에서는 "오늘은 딱 한 칸만"이라고 하면서.
 */
function countDueWords(progressById, todayKey) {
  return VOCAB_WORDS.filter((word) => {
    const progress = progressById[word.id];
    if (!progress || progress.reviewCount <= 0) {
      return false;
    }
    return !progress.dueDate || progress.dueDate <= todayKey;
  }).length;
}

function progress(overrides = {}) {
  return {
    status: "learning",
    dueDate: null,
    lastReviewedAt: null,
    intervalDays: 1,
    reviewCount: 1,
    streak: 0,
    favorite: false,
    ease: 2.5,
    mastery: 0,
    ...overrides,
  };
}

const TODAY = "2026-08-19";

test("아무것도 안 한 사람의 복습할 단어는 0개다", () => {
  assert.equal(
    countDueWords({}, TODAY),
    0,
    "처음 온 사람에게 복습거리가 1500개 있다고 말하면 안 된다",
  );
});

test("배운 적 없는 단어는 복습 대상이 아니다", () => {
  // reviewCount가 0이면 아직 만난 적이 없는 단어다.
  const state = { [VOCAB_WORDS[0].id]: progress({ reviewCount: 0 }) };
  assert.equal(countDueWords(state, TODAY), 0);
});

test("배운 단어 중 날짜가 된 것만 센다", () => {
  const [a, b, c] = VOCAB_WORDS;
  const state = {
    [a.id]: progress({ dueDate: TODAY }),
    [b.id]: progress({ dueDate: addDays(TODAY, -3) }),
    [c.id]: progress({ dueDate: addDays(TODAY, 5) }),
  };
  assert.equal(countDueWords(state, TODAY), 2, "오늘·지난 것만 세고 미래는 빼야 한다");
});

test("전체 단어 수가 복습 수로 새지 않는다", () => {
  // 모든 단어에 기록이 있어도, 날짜가 안 된 것은 세지 않는다.
  const state = {};
  for (const word of VOCAB_WORDS) {
    state[word.id] = progress({ dueDate: addDays(TODAY, 30) });
  }
  assert.equal(countDueWords(state, TODAY), 0);
  assert.ok(VOCAB_WORDS.length > 1000, "이 검사는 단어가 많을 때 의미가 있다");
});
