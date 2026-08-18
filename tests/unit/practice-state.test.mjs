import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  EMPTY_PRACTICE_STATE,
  MAX_WRONG_NOTES,
  migrateVocabIntoReview,
  normalizePracticeState,
  recordOutcome,
  getSkillAccuracy,
  summarizeMistakes,
  MISTAKE_LABELS,
} from "../../app/practice/practice-state.ts";

const TODAY = "2026-08-06";

function outcome(overrides = {}) {
  return {
    skillId: "ma-factor",
    seed: 4242,
    level: 1,
    isCorrect: false,
    mistakeTag: "one-sign",
    hintsUsed: 0,
    elapsedSeconds: 20,
    targetSeconds: 70,
    today: TODAY,
    ...overrides,
  };
}

test("normalizePracticeState fills in a usable shape from junk", () => {
  assert.deepEqual(normalizePracticeState(undefined), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState(null), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState(42), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState({ wrongNotes: "nope" }).wrongNotes, []);
  assert.deepEqual(normalizePracticeState({ reviewById: "nope" }).reviewById, {});
});

test("normalizePracticeState drops review entries with unrecognised keys", () => {
  const normalized = normalizePracticeState({
    reviewById: {
      "skill:ma-factor": { status: "review", dueDate: TODAY, intervalDays: 3 },
      "garbage": { status: "review" },
    },
  });
  assert.deepEqual(Object.keys(normalized.reviewById), ["skill:ma-factor"]);
});

test("a wrong answer is recorded in the notebook and schedules a review", () => {
  const next = recordOutcome(EMPTY_PRACTICE_STATE, outcome());
  assert.equal(next.wrongNotes.length, 1);
  assert.deepEqual(next.wrongNotes[0], {
    skillId: "ma-factor",
    seed: 4242,
    level: 1,
    mistakeTag: "one-sign",
    at: TODAY,
  });
  assert.equal(next.reviewById["skill:ma-factor"].status, "learning");
  assert.equal(next.reviewById["skill:ma-factor"].dueDate, TODAY);
});

test("a correct answer schedules a later review and adds no note", () => {
  const next = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, mistakeTag: null }));
  assert.equal(next.wrongNotes.length, 0);
  assert.ok(next.reviewById["skill:ma-factor"].dueDate > TODAY);
});

test("hints downgrade a correct answer to hard", () => {
  const withoutHints = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 60 }));
  const withHints = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, hintsUsed: 2, elapsedSeconds: 60 }));
  assert.ok(
    withHints.reviewById["skill:ma-factor"].intervalDays <
      withoutHints.reviewById["skill:ma-factor"].intervalDays,
  );
});

test("the newest wrong note comes first", () => {
  let state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ seed: 1 }));
  state = recordOutcome(state, outcome({ seed: 2 }));
  assert.deepEqual(state.wrongNotes.map((note) => note.seed), [2, 1]);
});

test("re-missing the same question moves it to the front instead of duplicating", () => {
  let state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ seed: 1 }));
  state = recordOutcome(state, outcome({ seed: 2 }));
  state = recordOutcome(state, outcome({ seed: 1 }));
  assert.deepEqual(state.wrongNotes.map((note) => note.seed), [1, 2]);
});

test("the notebook is capped and drops the oldest", () => {
  let state = EMPTY_PRACTICE_STATE;
  for (let seed = 0; seed < MAX_WRONG_NOTES + 20; seed += 1) {
    state = recordOutcome(state, outcome({ seed }));
  }
  assert.equal(state.wrongNotes.length, MAX_WRONG_NOTES);
  assert.equal(state.wrongNotes[0].seed, MAX_WRONG_NOTES + 19);
  assert.ok(state.wrongNotes.every((note) => note.seed >= 20));
});

test("recordOutcome does not mutate the state it was given", () => {
  const before = JSON.stringify(EMPTY_PRACTICE_STATE);
  recordOutcome(EMPTY_PRACTICE_STATE, outcome());
  assert.equal(JSON.stringify(EMPTY_PRACTICE_STATE), before);
});

test("migrateVocabIntoReview moves v2 word progress under the vocab prefix", () => {
  const legacy = {
    assume: { status: "review", dueDate: "2026-08-09", intervalDays: 3, ease: 2.3, mastery: 40, reviewCount: 2, streak: 2, favorite: true, lastReviewedAt: "2026-08-06" },
  };
  const migrated = migrateVocabIntoReview(legacy, {});
  assert.deepEqual(Object.keys(migrated), ["vocab:assume"]);
  assert.equal(migrated["vocab:assume"].mastery, 40);
  assert.equal(migrated["vocab:assume"].favorite, true);
});

test("migration never overwrites an entry that already exists", () => {
  const existing = { "vocab:assume": { ...EMPTY_PRACTICE_STATE.reviewById, mastery: 99, status: "completed", dueDate: null, intervalDays: 9, ease: 2.5, reviewCount: 9, streak: 9, favorite: false, lastReviewedAt: null } };
  const migrated = migrateVocabIntoReview({ assume: { status: "new", mastery: 0 } }, existing);
  assert.equal(migrated["vocab:assume"].mastery, 99);
});

test("skill stats accumulate attempts and correct answers", () => {
  let state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, mistakeTag: null }));
  state = recordOutcome(state, outcome({ isCorrect: false }));
  state = recordOutcome(state, outcome({ isCorrect: true, mistakeTag: null }));
  assert.deepEqual(state.skillStats["ma-factor"], { attempts: 3, correct: 2 });
});

test("accuracy is null before the first attempt", () => {
  assert.equal(getSkillAccuracy(EMPTY_PRACTICE_STATE, "ma-factor"), null);
  const state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, mistakeTag: null }));
  assert.equal(getSkillAccuracy(state, "ma-factor"), 1);
  assert.equal(getSkillAccuracy(state, "ma-linear-eq"), null, "안 푼 스킬을 0%로 보여 주면 안 된다");
});

test("mistakes are summarized most frequent first with readable labels", () => {
  let state = EMPTY_PRACTICE_STATE;
  for (const seed of [1, 2, 3]) {
    state = recordOutcome(state, outcome({ seed, mistakeTag: "sign-transpose" }));
  }
  state = recordOutcome(state, outcome({ seed: 4, mistakeTag: "not-reduced" }));

  const summary = summarizeMistakes(state);
  assert.equal(summary[0].tag, "sign-transpose");
  assert.equal(summary[0].count, 3);
  assert.equal(summary[0].label, "이항할 때 부호");
  assert.equal(summary[1].count, 1);
});

test("outcomes without a mistake tag are left out of the summary", () => {
  const state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ mistakeTag: null }));
  assert.deepEqual(summarizeMistakes(state), []);
});

test("every mistake tag the generators emit has a readable label", async () => {
  // 미쿠 대사집이 아니라 생성기가 실제로 붙이는 태그를 본다.
  // 태그를 새로 만들고 라벨을 안 붙이면 화면에 "sign-transpose"가 그대로 뜬다.
  const source = await readFile(new URL("../../app/practice/generators/math.ts", import.meta.url), "utf8");
  const tags = [...new Set([...source.matchAll(/mistakeTag: "([a-z-]+)"/g)].map((m) => m[1]))];
  assert.ok(tags.length > 10, `expected generator tags, found ${tags.length}`);
  for (const tag of tags) {
    assert.ok(MISTAKE_LABELS[tag], `${tag} has no Korean label`);
  }
});

test("normalizePracticeState repairs a corrupted stat", () => {
  const state = normalizePracticeState({ skillStats: { "ma-factor": { attempts: 2, correct: 9 } } });
  assert.deepEqual(state.skillStats["ma-factor"], { attempts: 2, correct: 2 });
});
