import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_PRACTICE_STATE,
  MAX_WRONG_NOTES,
  migrateVocabIntoReview,
  normalizePracticeState,
  recordOutcome,
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
