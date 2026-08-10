import assert from "node:assert/strict";
import test from "node:test";
import {
  computeMikuMood,
  countActiveDaysLast7,
  resolveGreetingEvent,
} from "../../app/miku/miku-mood.ts";

const BASE = {
  hour: 16,
  activeDaysLast7: 3,
  todayAnswered: 0,
  todayCorrect: 0,
  streakDays: 1,
};

test("모든 기분이 실제 입력 조합으로 도달 가능하다", () => {
  const reached = new Set([
    computeMikuMood({ ...BASE, hour: 2 }),
    computeMikuMood({ ...BASE, activeDaysLast7: 0 }),
    computeMikuMood({ ...BASE, streakDays: 5, todayAnswered: 5, todayCorrect: 5 }),
    computeMikuMood({ ...BASE, todayAnswered: 5, todayCorrect: 4 }),
    computeMikuMood({ ...BASE, activeDaysLast7: 2 }),
  ]);
  assert.deepEqual(
    [...reached].sort(),
    ["cheerful", "encouraging", "proud", "sleepy", "worried"],
  );
});

test("sleepy는 늦은 밤·새벽 시각에서만 나온다", () => {
  for (const hour of [23, 0, 3, 4]) {
    assert.equal(computeMikuMood({ ...BASE, hour }), "sleepy", `${hour}시`);
  }
  for (const hour of [5, 9, 15, 22]) {
    assert.notEqual(computeMikuMood({ ...BASE, hour }), "sleepy", `${hour}시`);
  }
});

test("sleepy는 성과가 아니라 시각에만 달려 있다", () => {
  const perfect = { hour: 1, activeDaysLast7: 7, todayAnswered: 10, todayCorrect: 10, streakDays: 30 };
  const awful = { hour: 1, activeDaysLast7: 0, todayAnswered: 10, todayCorrect: 0, streakDays: 0 };
  assert.equal(computeMikuMood(perfect), "sleepy");
  assert.equal(computeMikuMood(awful), "sleepy");
  // 같은 성과라도 낮이면 sleepy가 아니다.
  assert.notEqual(computeMikuMood({ ...perfect, hour: 14 }), "sleepy");
  assert.notEqual(computeMikuMood({ ...awful, hour: 14 }), "sleepy");
});

test("worried는 발길이 끊겼거나 오늘 많이 틀리는 중일 때 나온다", () => {
  assert.equal(computeMikuMood({ ...BASE, activeDaysLast7: 0 }), "worried");
  assert.equal(computeMikuMood({ ...BASE, activeDaysLast7: 1 }), "worried");
  assert.equal(
    computeMikuMood({ ...BASE, activeDaysLast7: 5, todayAnswered: 5, todayCorrect: 1 }),
    "worried",
  );
});

test("한두 문제 틀린 것만으로는 worried가 되지 않는다", () => {
  // 표본이 최소 문항 수에 못 미치면 정답률을 믿지 않는다.
  assert.notEqual(
    computeMikuMood({ ...BASE, activeDaysLast7: 4, todayAnswered: 2, todayCorrect: 0 }),
    "worried",
  );
});

test("proud는 연속 학습일과 오늘 정답률이 함께 높을 때만 나온다", () => {
  const proud = { ...BASE, streakDays: 3, todayAnswered: 5, todayCorrect: 5 };
  assert.equal(computeMikuMood(proud), "proud");
  // 연속 학습일이 짧으면 정답률이 좋아도 proud가 아니다.
  assert.notEqual(computeMikuMood({ ...proud, streakDays: 2 }), "proud");
  // 연속 학습일만 길고 오늘 푼 게 없으면 proud가 아니다.
  assert.notEqual(computeMikuMood({ ...proud, todayAnswered: 0, todayCorrect: 0 }), "proud");
});

test("cheerful은 오늘 정답률이 괜찮거나 최근에 자주 왔을 때 나온다", () => {
  assert.equal(computeMikuMood({ ...BASE, todayAnswered: 5, todayCorrect: 3 }), "cheerful");
  assert.equal(computeMikuMood({ ...BASE, activeDaysLast7: 4 }), "cheerful");
});

test("encouraging이 기본값이다", () => {
  assert.equal(computeMikuMood({ ...BASE, activeDaysLast7: 2 }), "encouraging");
  assert.equal(
    computeMikuMood({ ...BASE, activeDaysLast7: 3, todayAnswered: 4, todayCorrect: 2 }),
    "encouraging",
  );
});

test("computeMikuMood는 같은 입력에 같은 기분을 낸다", () => {
  const input = { ...BASE, todayAnswered: 7, todayCorrect: 6, streakDays: 4 };
  assert.equal(computeMikuMood(input), computeMikuMood({ ...input }));
});

test("computeMikuMood는 망가진 입력에도 기분 하나를 돌려준다", () => {
  const moods = ["cheerful", "encouraging", "proud", "worried", "sleepy"];
  assert.ok(moods.includes(computeMikuMood({ ...BASE, hour: Number.NaN })));
  assert.ok(moods.includes(computeMikuMood({ ...BASE, todayAnswered: -3, todayCorrect: -1 })));
  assert.ok(
    moods.includes(computeMikuMood({ ...BASE, todayAnswered: 2, todayCorrect: 99 })),
    "맞힌 수가 푼 수보다 커도 터지지 않는다",
  );
});

test("countActiveDaysLast7은 오늘 포함 7일 중 공부한 날만 센다", () => {
  const log = {
    "2026-08-10": 12,
    "2026-08-09": 0,
    "2026-08-08": 5,
    "2026-08-04": 30,
    // 7일 창 밖
    "2026-08-03": 40,
    "2026-07-30": 20,
  };
  assert.equal(countActiveDaysLast7(log, "2026-08-10"), 3);
  assert.equal(countActiveDaysLast7({}, "2026-08-10"), 0);
});

test("resolveGreetingEvent는 사흘 이상 비면 comeback을 낸다", () => {
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: "2026-08-07", hour: 15 }),
    "comeback",
  );
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: "2026-08-01", hour: 15 }),
    "comeback",
  );
  // 처음 온 사람은 comeback이 아니다.
  assert.notEqual(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: null, hour: 15 }),
    "comeback",
  );
});

test("resolveGreetingEvent는 늦은 밤을 comeback보다 우선한다", () => {
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: "2026-08-01", hour: 1 }),
    "lateNight",
  );
});

test("resolveGreetingEvent는 오늘 첫 접속이면 dailyFirst를 낸다", () => {
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: "2026-08-09", hour: 15 }),
    "dailyFirst",
  );
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: null, hour: 15 }),
    "dailyFirst",
  );
});

test("resolveGreetingEvent는 같은 날 다시 오면 sessionStart를 낸다", () => {
  assert.equal(
    resolveGreetingEvent({ todayKey: "2026-08-10", lastSeenDate: "2026-08-10", hour: 15 }),
    "sessionStart",
  );
});
