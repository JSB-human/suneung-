import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  applyRating,
  createInitialProgress,
  isDue,
  listDueKeys,
  parseKey,
  skillKey,
  vocabKey,
} from "../../app/practice/review-queue.ts";

test("addDays walks the calendar correctly", () => {
  assert.equal(addDays("2026-08-06", 1), "2026-08-07");
  assert.equal(addDays("2026-08-31", 1), "2026-09-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  assert.equal(addDays("2026-08-06", 0), "2026-08-06");
});

test("a brand new item starts unseen and is due immediately", () => {
  const fresh = createInitialProgress();
  assert.equal(fresh.status, "new");
  assert.equal(fresh.reviewCount, 0);
  assert.equal(fresh.dueDate, null);
  assert.equal(isDue(null, "2026-08-06"), true);
  assert.equal(isDue(fresh, "2026-08-06"), true);
});

test("again resets the interval and schedules for today", () => {
  const next = applyRating(null, "again", "2026-08-06");
  assert.equal(next.status, "learning");
  assert.equal(next.dueDate, "2026-08-06");
  assert.equal(next.intervalDays, 0);
  assert.equal(next.streak, 0);
  assert.equal(next.reviewCount, 1);
});

test("good and easy push the due date further out than hard", () => {
  const hard = applyRating(null, "hard", "2026-08-06");
  const good = applyRating(null, "good", "2026-08-06");
  const easy = applyRating(null, "easy", "2026-08-06");
  assert.ok(hard.intervalDays < good.intervalDays, `${hard.intervalDays} < ${good.intervalDays}`);
  assert.ok(good.intervalDays < easy.intervalDays, `${good.intervalDays} < ${easy.intervalDays}`);
  assert.equal(hard.dueDate, addDays("2026-08-06", hard.intervalDays));
  assert.equal(easy.dueDate, addDays("2026-08-06", easy.intervalDays));
});

test("repeated easy ratings eventually complete the item", () => {
  let progress = null;
  for (let round = 0; round < 4; round += 1) {
    progress = applyRating(progress, "easy", "2026-08-06");
  }
  assert.equal(progress.status, "completed");
  assert.ok(progress.mastery >= 60);
});

test("intervals stay inside their documented caps", () => {
  let progress = null;
  for (let round = 0; round < 40; round += 1) {
    progress = applyRating(progress, "easy", "2026-08-06");
  }
  assert.ok(progress.intervalDays <= 45, `easy interval exceeded cap: ${progress.intervalDays}`);
  assert.ok(progress.ease <= 3.2, `ease exceeded cap: ${progress.ease}`);
  assert.ok(progress.mastery <= 100, `mastery exceeded cap: ${progress.mastery}`);

  let hardProgress = null;
  for (let round = 0; round < 40; round += 1) {
    hardProgress = applyRating(hardProgress, "hard", "2026-08-06");
  }
  assert.ok(hardProgress.intervalDays <= 10, `hard interval exceeded cap: ${hardProgress.intervalDays}`);
  assert.ok(hardProgress.ease >= 1.4, `ease fell below floor: ${hardProgress.ease}`);
});

test("again never drops ease or mastery below the floor", () => {
  let progress = null;
  for (let round = 0; round < 40; round += 1) {
    progress = applyRating(progress, "again", "2026-08-06");
  }
  assert.ok(progress.ease >= 1.3, `ease fell below floor: ${progress.ease}`);
  assert.equal(progress.mastery, 0);
});

test("favorite survives a rating", () => {
  const favorited = { ...createInitialProgress(), favorite: true };
  assert.equal(applyRating(favorited, "good", "2026-08-06").favorite, true);
});

test("isDue compares against the due date", () => {
  const progress = applyRating(null, "good", "2026-08-06");
  assert.equal(isDue(progress, "2026-08-06"), false);
  assert.equal(isDue(progress, progress.dueDate), true);
  assert.equal(isDue(progress, addDays(progress.dueDate, 5)), true);
});

test("keys carry their kind", () => {
  assert.equal(vocabKey("assume"), "vocab:assume");
  assert.equal(skillKey("ma-factor"), "skill:ma-factor");
  assert.deepEqual(parseKey("vocab:assume"), { kind: "vocab", id: "assume" });
  assert.deepEqual(parseKey("skill:ma-factor"), { kind: "skill", id: "ma-factor" });
  assert.equal(parseKey("nonsense"), null);
  assert.equal(parseKey("other:thing"), null);
});

test("parseKey keeps colons that belong to the id", () => {
  assert.deepEqual(parseKey("skill:ma:weird"), { kind: "skill", id: "ma:weird" });
});

test("listDueKeys returns only due entries of the requested kind", () => {
  const today = "2026-08-10";
  const progressById = {
    "skill:ma-factor": applyRating(null, "again", today),
    "skill:ma-linear-eq": applyRating(null, "easy", today),
    "vocab:assume": applyRating(null, "again", today),
  };

  assert.deepEqual(listDueKeys(progressById, today, "skill"), ["skill:ma-factor"]);
  assert.deepEqual(listDueKeys(progressById, today, "vocab"), ["vocab:assume"]);
  assert.deepEqual(listDueKeys(progressById, today).sort(), ["skill:ma-factor", "vocab:assume"]);
});

test("listDueKeys orders by due date, oldest first", () => {
  const progressById = {
    "skill:b": { ...createInitialProgress(), status: "review", dueDate: "2026-08-09" },
    "skill:a": { ...createInitialProgress(), status: "review", dueDate: "2026-08-01" },
    "skill:c": { ...createInitialProgress(), status: "review", dueDate: "2026-08-05" },
  };
  assert.deepEqual(listDueKeys(progressById, "2026-08-10", "skill"), ["skill:a", "skill:c", "skill:b"]);
});
