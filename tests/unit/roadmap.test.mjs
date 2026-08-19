import assert from "node:assert/strict";
import test from "node:test";
import { getNodesForSubject } from "../../app/path/path-nodes.ts";
import { EMPTY_PATH_STATE, completeNode } from "../../app/path/path-state.ts";
import {
  EXAM_DATE_KEY,
  PHASES,
  getCourseStartDate,
  getNewNodeHorizonDate,
  getPhaseForDate,
} from "../../app/path/phases.ts";
import {
  MAX_NODES_PER_WEEK,
  allocateNodesPerWeek,
  buildRoadmap,
  formatWeekRange,
  groupWeeksByPhase,
  startOfWeek,
} from "../../app/path/roadmap.ts";

const SUBJECTS = ["korean", "english", "math"];

function stateWithFirst(subject, count) {
  let state = EMPTY_PATH_STATE;
  for (const node of getNodesForSubject(subject).slice(0, count)) {
    state = completeNode(state, node.id, 3, 3);
  }
  return state;
}

function planFor(subject, todayKey, state = EMPTY_PATH_STATE) {
  return buildRoadmap({ subject, state, todayKey });
}

// --- 단계 데이터 --------------------------------------------------------------

test("phases are contiguous, ordered, and end on the exam date", () => {
  assert.equal(PHASES.length, 4);
  for (let index = 0; index < PHASES.length; index += 1) {
    const phase = PHASES[index];
    assert.ok(phase.startDate <= phase.endDate, `${phase.id}: 시작이 끝보다 늦다`);
    assert.ok(phase.name.trim(), `${phase.id}: 이름 없음`);
    assert.ok(phase.focus.trim(), `${phase.id}: 설명 없음`);
    const next = PHASES[index + 1];
    if (next) {
      assert.equal(
        next.startDate,
        new Date(
          Date.UTC(
            Number(phase.endDate.slice(0, 4)),
            Number(phase.endDate.slice(5, 7)) - 1,
            Number(phase.endDate.slice(8, 10)) + 1,
          ),
        )
          .toISOString()
          .slice(0, 10),
        `${phase.id} 다음 단계가 하루 뒤에 시작하지 않는다`,
      );
    }
  }
  assert.equal(PHASES[PHASES.length - 1].endDate, EXAM_DATE_KEY);
});

test("getPhaseForDate answers for any date, even before the course or after the exam", () => {
  assert.equal(getPhaseForDate("2020-01-01").id, "foundation");
  assert.equal(getPhaseForDate("2026-10-01").id, "foundation");
  assert.equal(getPhaseForDate("2027-03-01").id, "concept");
  assert.equal(getPhaseForDate("2027-08-15").id, "pattern");
  assert.equal(getPhaseForDate("2027-11-01").id, "final");
  assert.equal(getPhaseForDate("2099-01-01").id, "final");
});

test("the new-node horizon is the end of the last phase that accepts new nodes", () => {
  assert.equal(getNewNodeHorizonDate(), "2027-06-30");
  assert.equal(getCourseStartDate(), "2026-08-01");
});

// --- 주 격자 ------------------------------------------------------------------

test("startOfWeek snaps to Monday and is idempotent", () => {
  assert.equal(startOfWeek("2026-08-07"), "2026-08-03"); // 금요일 → 그 주 월요일
  assert.equal(startOfWeek("2026-08-03"), "2026-08-03"); // 월요일은 그대로
  assert.equal(startOfWeek("2026-08-09"), "2026-08-03"); // 일요일은 앞 월요일
  assert.equal(startOfWeek(startOfWeek("2026-08-07")), "2026-08-03");
});

test("weeks are contiguous seven-day blocks starting at today's week", () => {
  const plan = planFor("korean", "2026-08-07");
  assert.equal(plan.weeks[0].weekIndex, 0);
  assert.equal(plan.weeks[0].startDate, "2026-08-03");
  assert.equal(plan.weeks[0].endDate, "2026-08-09");
  for (let index = 1; index < plan.weeks.length; index += 1) {
    const previous = plan.weeks[index - 1];
    const week = plan.weeks[index];
    assert.equal(week.weekIndex, index);
    assert.equal(week.startDate > previous.endDate, true);
    assert.equal(week.vocabCount > 0, true, "단어 배정이 0이면 안 된다");
  }
});

test("the grid reaches the exam week", () => {
  const plan = planFor("korean", "2026-08-07");
  const last = plan.weeks[plan.weeks.length - 1];
  assert.ok(last.startDate <= EXAM_DATE_KEY, "격자가 수능 주에 못 미친다");
  assert.ok(last.endDate >= EXAM_DATE_KEY, "격자가 수능 주에 못 미친다");
  assert.equal(plan.weeks.length, plan.weeksUntilExam + 1);
});

// --- 설계 검증 1: 밀렸을 때 재조정 -------------------------------------------

test("1. shrinking the remaining weeks raises the weekly load", () => {
  const early = planFor("korean", "2026-08-07");
  const mid = planFor("korean", "2027-02-01");
  const late = planFor("korean", "2027-05-24");

  assert.ok(
    early.nodesPerWeek <= mid.nodesPerWeek,
    `early ${early.nodesPerWeek} > mid ${mid.nodesPerWeek}`,
  );
  assert.ok(
    mid.nodesPerWeek <= late.nodesPerWeek,
    `mid ${mid.nodesPerWeek} > late ${late.nodesPerWeek}`,
  );
  assert.ok(late.nodesPerWeek > early.nodesPerWeek, "끝까지 밀렸는데 배정이 그대로다");
});

test("1b. the weekly load is monotone non-decreasing as today moves forward", () => {
  let previous = 0;
  for (const todayKey of [
    "2026-08-07",
    "2026-11-01",
    "2027-01-15",
    "2027-03-01",
    "2027-04-15",
    "2027-05-31",
    "2027-06-21",
  ]) {
    const plan = planFor("korean", todayKey);
    assert.ok(
      plan.nodesPerWeek >= previous,
      `${todayKey}: ${plan.nodesPerWeek} < 직전 ${previous}`,
    );
    previous = plan.nodesPerWeek;
  }
});

test("1c. falling behind never invalidates the plan — every node still has a week", () => {
  const plan = planFor("korean", "2027-06-01");
  const assigned = plan.weeks.flatMap((week) => week.nodeIds);
  assert.equal(assigned.length, plan.remainingCount);
  assert.ok(plan.finishWeekIndex !== null);
  assert.ok(plan.finishDate <= EXAM_DATE_KEY, "밀렸는데 계획이 수능을 넘겼다");
});

// --- 설계 검증 2: 앞서 있음 ---------------------------------------------------

test("2. running ahead of the baseline reports 'ahead'", () => {
  const todayKey = "2026-09-07"; // 학습 시작 다섯째 주
  const behindPlan = planFor("korean", todayKey, EMPTY_PATH_STATE);
  assert.equal(behindPlan.pace, "behind");
  assert.ok(behindPlan.nodesAhead < 0);
  assert.ok(behindPlan.weeksAhead < 0);

  const aheadPlan = planFor("korean", todayKey, stateWithFirst("korean", 12));
  assert.equal(aheadPlan.pace, "ahead");
  assert.ok(aheadPlan.nodesAhead > 0);
  assert.ok(aheadPlan.weeksAhead > 0);
});

test("2a. a beginner on day one is on track, not already behind", () => {
  for (const subject of SUBJECTS) {
    const plan = planFor(subject, "2026-08-07");
    assert.equal(plan.pace, "onTrack", `${subject}: 첫날부터 밀렸다고 말하면 안 된다`);
    assert.equal(plan.nodesAhead, 0);
    // 집필이 늘면 주당 배정도 1칸에서 2칸으로 올라간다. 숫자를 1로 못 박으면
    // 칸을 쓸 때마다 이 테스트가 깨지므로, 첫 주가 요구하는 양과 첫 주 목표가
    // 서로 어긋나지 않는지로 확인한다 — 어긋나면 "이번 주 할 일"과 "이번 주
    // 기준"이 다른 말을 하게 된다.
    assert.ok(plan.nodesPerWeek >= 1, `${subject}: 첫 주에 할 일이 없다`);
    assert.equal(plan.weekGoalCumulative, plan.nodesPerWeek);
  }
});

test("2b. anywhere inside this week's band reads as on track", () => {
  const todayKey = "2026-09-07";
  const reference = planFor("korean", todayKey, EMPTY_PATH_STATE);
  const expectedDone = -reference.nodesAhead;
  const weekGoal = reference.weekGoalCumulative;
  assert.ok(weekGoal > expectedDone, "이번 주 목표가 지난주 기준보다 커야 한다");

  for (let done = expectedDone; done <= weekGoal; done += 1) {
    const plan = planFor("korean", todayKey, stateWithFirst("korean", done));
    assert.equal(plan.pace, "onTrack", `${done}칸 완료가 onTrack이 아니다`);
    assert.equal(plan.nodesAhead, 0);
  }

  // 이번 주 몫을 막 끝낸 것은 "앞서 있는" 게 아니다 — 제때다.
  const justMet = planFor("korean", todayKey, stateWithFirst("korean", weekGoal));
  assert.equal(justMet.isWeekGoalMet, true);
  assert.equal(justMet.pace, "onTrack");

  const oneMore = planFor("korean", todayKey, stateWithFirst("korean", weekGoal + 1));
  assert.equal(oneMore.pace, "ahead");
  assert.equal(oneMore.nodesAhead, 1);
});

test("2c. the weekly goal is anchored to the calendar, not to progress", () => {
  const todayKey = "2026-10-05";
  const none = planFor("korean", todayKey, EMPTY_PATH_STATE);
  const some = planFor("korean", todayKey, stateWithFirst("korean", 4));
  assert.equal(
    none.weekGoalCumulative,
    some.weekGoalCumulative,
    "이번 주 목표가 진도에 따라 움직이면 절대 '이번 주 완료'가 안 된다",
  );
  assert.equal(none.isWeekGoalMet, false);
  const met = planFor("korean", todayKey, stateWithFirst("korean", none.weekGoalCumulative));
  assert.equal(met.isWeekGoalMet, true);
});

// --- 설계 검증 3: 주당 상한 ---------------------------------------------------

test("3. no week ever exceeds the three-nodes-a-day cap", () => {
  for (const subject of SUBJECTS) {
    for (const todayKey of [
      "2026-08-07",
      "2027-03-01",
      "2027-06-29",
      "2027-09-01",
      "2027-11-15",
      "2027-11-18",
      "2028-01-01",
    ]) {
      for (const week of planFor(subject, todayKey).weeks) {
        assert.ok(
          week.nodeIds.length <= MAX_NODES_PER_WEEK,
          `${subject} ${todayKey} 주 ${week.weekIndex}: ${week.nodeIds.length}칸`,
        );
      }
    }
  }
});

test("3b. when the cap cannot fit the plan, the warning flag is raised instead", () => {
  const roomy = planFor("korean", "2026-08-07");
  assert.equal(roomy.isOverCapacity, false);

  const impossible = planFor("korean", "2027-11-15"); // 수능 주. 남은 주가 한 주뿐
  assert.equal(impossible.isOverCapacity, true, "31칸을 한 주에 넣으라고 하면서 경고가 없다");
  for (const week of impossible.weeks) {
    assert.ok(week.nodeIds.length <= MAX_NODES_PER_WEEK);
  }
  const assigned = impossible.weeks.flatMap((week) => week.nodeIds);
  assert.equal(assigned.length, impossible.remainingCount, "상한에 걸렸다고 칸을 버렸다");
});

test("3c. allocateNodesPerWeek keeps the cap and never drops anything", () => {
  assert.deepEqual(allocateNodesPerWeek(0, 3), [0, 0, 0]);
  assert.deepEqual(allocateNodesPerWeek(3, 3), [1, 1, 1]);
  assert.deepEqual(allocateNodesPerWeek(4, 3), [2, 2, 0]);
  assert.deepEqual(allocateNodesPerWeek(2, 5), [1, 1, 0, 0, 0]);
  assert.deepEqual(allocateNodesPerWeek(10, 2, 3), [3, 3, 3, 1]);
  assert.deepEqual(allocateNodesPerWeek(5, 0), [5]);
  assert.deepEqual(allocateNodesPerWeek(-4, 2), [0, 0]);

  for (const [total, weeks] of [
    [84, 60],
    [31, 1],
    [22, 7],
    [1, 100],
  ]) {
    const counts = allocateNodesPerWeek(total, weeks);
    assert.equal(
      counts.reduce((sum, value) => sum + value, 0),
      total,
    );
    assert.ok(counts.length >= weeks);
    for (const count of counts) {
      assert.ok(count <= MAX_NODES_PER_WEEK);
    }
  }
});

// --- 설계 검증 4: 수능일 이후 ------------------------------------------------

test("4. the plan stays valid after the exam date has passed", () => {
  for (const subject of SUBJECTS) {
    const plan = planFor(subject, "2028-03-01");
    assert.equal(plan.isAfterExam, true);
    assert.ok(plan.daysUntilExam < 0);
    assert.ok(plan.weeks.length >= 1, "주가 하나도 없다");
    assert.equal(plan.currentWeek, plan.weeks[0]);
    assert.equal(plan.currentWeek.startDate, startOfWeek("2028-03-01"));
    assert.equal(plan.currentWeek.phase, "final");
    const assigned = plan.weeks.flatMap((week) => week.nodeIds);
    assert.equal(assigned.length, plan.remainingCount, "수능 이후에 칸이 사라졌다");
    for (const week of plan.weeks) {
      assert.ok(week.nodeIds.length <= MAX_NODES_PER_WEEK);
      assert.ok(week.startDate <= week.endDate);
    }
  }
});

test("4b. the plan is valid on the exam day itself and when the path is finished", () => {
  const onExamDay = planFor("math", EXAM_DATE_KEY);
  assert.equal(onExamDay.isAfterExam, false);
  assert.equal(onExamDay.daysUntilExam, 0);
  assert.ok(onExamDay.weeks.length >= 1);

  const mathNodeCount = getNodesForSubject("math").length;
  const finished = planFor("math", "2027-01-04", stateWithFirst("math", mathNodeCount));
  assert.equal(finished.remainingCount, 0);
  assert.equal(finished.nodesPerWeek, 0);
  assert.equal(finished.finishWeekIndex, null);
  assert.equal(finished.finishDate, null);
  assert.equal(finished.isOverCapacity, false);
  assert.equal(finished.isWeekGoalMet, true);
  assert.ok(finished.weeks.length > 1);
});

// --- 설계 검증 5: 순수 함수 ---------------------------------------------------

test("5. the same inputs give the same output", () => {
  const state = stateWithFirst("english", 6);
  const first = buildRoadmap({ subject: "english", state, todayKey: "2026-11-09" });
  const second = buildRoadmap({ subject: "english", state, todayKey: "2026-11-09" });
  assert.deepEqual(first, second);
  assert.notEqual(first, second, "같은 객체를 캐시해 돌려주면 상태 공유 사고가 난다");

  const before = JSON.stringify(state);
  buildRoadmap({ subject: "english", state, todayKey: "2026-11-09" });
  assert.equal(JSON.stringify(state), before, "입력 상태를 변형했다");
});

test("5b. the exam date can be overridden and the plan follows it", () => {
  const plan = buildRoadmap({
    subject: "math",
    state: EMPTY_PATH_STATE,
    todayKey: "2026-08-07",
    examDateKey: "2026-09-30",
  });
  assert.equal(plan.examDateKey, "2026-09-30");
  assert.equal(plan.daysUntilExam, 54);
  assert.ok(plan.weeks.length >= 1);
  assert.equal(
    plan.weeks.flatMap((week) => week.nodeIds).length,
    plan.remainingCount,
  );
});

// --- 설계 검증 6: 빠지는 칸이 없다 --------------------------------------------

test("6. every remaining path node lands in exactly one week", () => {
  for (const subject of SUBJECTS) {
    for (const [todayKey, doneCount] of [
      ["2026-08-07", 0],
      ["2026-12-25", 3],
      ["2027-04-01", 10],
      ["2027-06-30", 0],
      ["2027-10-20", 1],
      ["2029-01-01", 0],
    ]) {
      const state = stateWithFirst(subject, doneCount);
      const plan = buildRoadmap({ subject, state, todayKey });
      const assigned = plan.weeks.flatMap((week) => week.nodeIds);
      const expected = getNodesForSubject(subject)
        .filter((node) => !state.completedNodeIds.includes(node.id))
        .map((node) => node.id);

      assert.equal(new Set(assigned).size, assigned.length, `${subject} ${todayKey}: 중복 배정`);
      assert.deepEqual(assigned, expected, `${subject} ${todayKey}: 배정이 길 순서와 다르다`);
    }
  }
});

test("6b. nodes are assigned in path order, never out of sequence", () => {
  const plan = planFor("math", "2027-05-03");
  const order = new Map(getNodesForSubject("math").map((node) => [node.id, node.order]));
  const assigned = plan.weeks.flatMap((week) => week.nodeIds).map((id) => order.get(id));
  for (let index = 1; index < assigned.length; index += 1) {
    assert.ok(assigned[index] > assigned[index - 1], "칸 순서가 뒤집혔다");
  }
});

// --- 표시용 도우미 ------------------------------------------------------------

test("groupWeeksByPhase covers every week once, in order", () => {
  const plan = planFor("korean", "2026-08-07");
  const groups = groupWeeksByPhase(plan.weeks);
  assert.ok(groups.length >= 2);
  const flattened = groups.flatMap((group) => group.weeks);
  assert.deepEqual(
    flattened.map((week) => week.weekIndex),
    plan.weeks.map((week) => week.weekIndex),
  );
  assert.deepEqual(
    groups.map((group) => group.phase),
    ["foundation", "concept", "pattern", "final"],
  );
  assert.equal(
    groups.reduce((sum, group) => sum + group.nodeCount, 0),
    plan.remainingCount,
  );
  assert.equal(groups[groups.length - 1].nodeCount, 0, "실전 단계에 새 칸이 배정됐다");
});

test("no new nodes are scheduled past the new-node horizon when there is room", () => {
  const plan = planFor("korean", "2026-08-07");
  const horizon = getNewNodeHorizonDate();
  for (const week of plan.weeks) {
    if (week.startDate > horizon) {
      assert.equal(week.nodeIds.length, 0, `${week.startDate}: 복습 구간에 새 칸이 있다`);
    }
  }
});

test("formatWeekRange reads as Korean dates", () => {
  assert.equal(
    formatWeekRange({ startDate: "2026-08-03", endDate: "2026-08-09" }),
    "8월 3일 ~ 8월 9일",
  );
});
