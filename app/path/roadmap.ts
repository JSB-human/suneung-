/**
 * 로드맵 — 길을 시간축에 투영한다.
 *
 * 길(`path-nodes.ts`)은 "다음에 뭘 할지"(순서)를 답하고,
 * 로드맵은 "언제까지 어디까지"(기한)를 답한다. 같은 데이터의 두 가지 보기다.
 *
 * 주별 계획을 손으로 쓰지 않는 이유: 수능까지 65주 × 3과목 = 195칸을 손으로 쓰면
 * 학습자가 하루라도 밀리는 순간 전부 틀린 계획이 된다. 노베이스는 반드시 밀린다.
 * 대신 남은 칸을 남은 주로 나눈다 — 밀리면 계획이 틀리는 대신 주당 배정이 늘어난다.
 *
 * 전부 순수 함수다. `Date.now()`를 부르지 않고 오늘 날짜를 인자로 받는다.
 */

import { addDays } from "../practice/review-queue.ts";
import type { Subject } from "../practice/types.ts";
import { getNodesForSubject } from "./path-nodes.ts";
import type { PathState } from "./path-state.ts";
import {
  EXAM_DATE_KEY,
  getCourseStartDate,
  getNewNodeHorizonDate,
  getPhaseForDate,
  type PhaseId,
} from "./phases.ts";

/** 하루 3칸을 넘겨 요구하지 않는다. 무한정 늘려 잡아 좌절시키지 않기 위한 상한이다. */
export const MAX_NODES_PER_DAY = 3;
export const DAYS_PER_WEEK = 7;
export const MAX_NODES_PER_WEEK = MAX_NODES_PER_DAY * DAYS_PER_WEEK;

export type WeekPlan = {
  /** 오늘이 속한 주가 0 */
  weekIndex: number;
  startDate: string;
  endDate: string;
  phase: PhaseId;
  /** 이 주에 할 길 칸 */
  nodeIds: string[];
  /** 이 주에 볼 단어 수 */
  vocabCount: number;
};

export type RoadmapPace = "ahead" | "onTrack" | "behind";

export type Roadmap = {
  subject: Subject;
  todayKey: string;
  examDateKey: string;
  /** 이번 주부터 수능 주까지. 상한에 걸려 넘치면 그 뒤 주까지 이어진다. */
  weeks: WeekPlan[];
  currentWeek: WeekPlan;
  doneCount: number;
  totalCount: number;
  remainingCount: number;
  /** 이번 주 배정 칸 수 */
  nodesPerWeek: number;
  /** 이번 주가 끝날 때까지 끝냈어야 하는 누적 칸 수 (달력에 고정, 진도에 따라 움직이지 않음) */
  weekGoalCumulative: number;
  /** 이번 주 몫을 이미 채웠는가 */
  isWeekGoalMet: boolean;
  /** 마지막 칸이 배정된 주. 남은 칸이 없으면 null */
  finishWeekIndex: number | null;
  finishDate: string | null;
  daysUntilExam: number;
  weeksUntilExam: number;
  pace: RoadmapPace;
  /** 양수면 앞서 있는 주 수, 음수면 밀린 주 수 */
  weeksAhead: number;
  /** 양수면 앞서 있는 칸 수, 음수면 밀린 칸 수 */
  nodesAhead: number;
  /** 상한(하루 3칸) 안에서는 수능 전에 길을 끝낼 수 없다 */
  isOverCapacity: boolean;
  isAfterExam: boolean;
};

export type RoadmapInput = {
  subject: Subject;
  state: PathState;
  todayKey: string;
  examDateKey?: string;
};

const MILLISECONDS_PER_DAY = 86_400_000;

function toDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  return new Date(year, month - 1, day);
}

function diffDays(fromDateKey: string, toDateKey: string): number {
  return Math.round(
    (toDate(toDateKey).getTime() - toDate(fromDateKey).getTime()) / MILLISECONDS_PER_DAY,
  );
}

/** 주는 월요일에 시작한다. */
export function startOfWeek(dateKey: string): string {
  const offset = (toDate(dateKey).getDay() + 6) % 7;
  return offset === 0 ? dateKey : addDays(dateKey, -offset);
}

function diffWeeks(fromWeekStart: string, toWeekStart: string): number {
  return Math.round(diffDays(fromWeekStart, toWeekStart) / DAYS_PER_WEEK);
}

/**
 * 그 날짜 이후 첫 "온전한" 주의 시작일.
 * 학습 시작일이 주 중간이면 그 주를 기준에 넣지 않는다 — 이틀짜리 주에 한 칸을
 * 요구해 놓고 첫날부터 "밀렸다"고 말하지 않기 위해서다.
 */
function firstFullWeekStart(dateKey: string): string {
  const start = startOfWeek(dateKey);
  return start === dateKey ? start : addDays(start, DAYS_PER_WEEK);
}

/**
 * `total`개를 `weekCount`주에 나눈다.
 *
 * - 주당 배정 = ceil(남은 칸 / 남은 주), 단 최소 1칸·최대 `cap`칸
 * - 최소 1칸인 이유: 0칸인 주가 이어지면 "이번 주 할 일 없음"이 되어 길을 잃는다.
 *   대신 일찍 끝나고 남는 주는 복습 주간이 된다.
 * - 상한에 걸려 `weekCount`주 안에 못 담으면 배열이 그만큼 길어진다.
 *   **어떤 칸도 버리지 않는다.**
 */
export function allocateNodesPerWeek(
  total: number,
  weekCount: number,
  cap: number = MAX_NODES_PER_WEEK,
): number[] {
  const weeks = Math.max(1, Math.floor(weekCount));
  if (total <= 0) {
    return new Array<number>(weeks).fill(0);
  }

  const perWeek = Math.min(Math.max(1, cap), Math.max(1, Math.ceil(total / weeks)));
  const counts: number[] = [];
  let left = total;
  while (left > 0) {
    const take = Math.min(perWeek, left);
    counts.push(take);
    left -= take;
  }
  while (counts.length < weeks) {
    counts.push(0);
  }
  return counts;
}

export function buildRoadmap({
  subject,
  state,
  todayKey,
  examDateKey = EXAM_DATE_KEY,
}: RoadmapInput): Roadmap {
  const nodes = getNodesForSubject(subject);
  const completed = new Set(state.completedNodeIds);
  const remaining = nodes.filter((node) => !completed.has(node.id));
  const doneCount = nodes.length - remaining.length;

  const currentWeekStart = startOfWeek(todayKey);
  const examWeekStart = startOfWeek(examDateKey);
  const weeksUntilExam = diffWeeks(currentWeekStart, examWeekStart);

  const horizonWeekStart = startOfWeek(getNewNodeHorizonDate());

  // 새 칸을 배정할 수 있는 주 수. 지평선을 이미 지났으면 수능까지로,
  // 수능도 지났으면 이번 주 한 주로 줄인다 — 어떤 날짜를 넣어도 1 이상이다.
  let planWeeks = diffWeeks(currentWeekStart, horizonWeekStart) + 1;
  if (planWeeks < 1) {
    planWeeks = weeksUntilExam + 1;
  }
  if (planWeeks < 1) {
    planWeeks = 1;
  }

  const counts = allocateNodesPerWeek(remaining.length, planWeeks);
  const isOverCapacity = counts.length > planWeeks;

  const gridLength = Math.max(counts.length, weeksUntilExam + 1, 1);
  const weeks: WeekPlan[] = [];
  let cursor = 0;
  for (let index = 0; index < gridLength; index += 1) {
    const startDate = addDays(currentWeekStart, index * DAYS_PER_WEEK);
    const take = counts[index] ?? 0;
    const nodeIds = remaining.slice(cursor, cursor + take).map((node) => node.id);
    cursor += take;
    const phase = getPhaseForDate(startDate);
    weeks.push({
      weekIndex: index,
      startDate,
      endDate: addDays(startDate, DAYS_PER_WEEK - 1),
      phase: phase.id,
      nodeIds,
      vocabCount: phase.vocabPerDay * DAYS_PER_WEEK,
    });
  }

  const lastPlanned = weeks.reduce(
    (last, week) => (week.nodeIds.length > 0 ? week.weekIndex : last),
    -1,
  );
  const finishWeekIndex = lastPlanned >= 0 ? lastPlanned : null;

  // 기준 계획: 학습 시작일부터 지평선까지 전 과목 칸을 고르게 편 것.
  // 진도가 여기보다 앞서면 앞선 것, 뒤지면 밀린 것이다.
  const courseStartWeek = firstFullWeekStart(getCourseStartDate());
  const baselineWeeks = Math.max(1, diffWeeks(courseStartWeek, horizonWeekStart) + 1);
  const baseline = allocateNodesPerWeek(nodes.length, baselineWeeks);
  const basePerWeek = Math.max(1, baseline[0] ?? 1);
  const elapsedWeeks = Math.max(0, diffWeeks(courseStartWeek, currentWeekStart));

  let expectedDone = 0;
  for (let index = 0; index < elapsedWeeks && index < baseline.length; index += 1) {
    expectedDone += baseline[index];
  }
  const weekGoalCumulative = Math.min(
    nodes.length,
    expectedDone + (baseline[elapsedWeeks] ?? 0),
  );

  const nodesAhead = doneCount - expectedDone;
  const weeksAhead = Math.trunc(nodesAhead / basePerWeek);
  const pace: RoadmapPace =
    nodesAhead >= basePerWeek ? "ahead" : nodesAhead <= -basePerWeek ? "behind" : "onTrack";

  return {
    subject,
    todayKey,
    examDateKey,
    weeks,
    currentWeek: weeks[0],
    doneCount,
    totalCount: nodes.length,
    remainingCount: remaining.length,
    nodesPerWeek: weeks[0].nodeIds.length,
    weekGoalCumulative,
    isWeekGoalMet: doneCount >= weekGoalCumulative,
    finishWeekIndex,
    finishDate: finishWeekIndex === null ? null : weeks[finishWeekIndex].endDate,
    daysUntilExam: diffDays(todayKey, examDateKey),
    weeksUntilExam,
    pace,
    weeksAhead,
    nodesAhead,
    isOverCapacity,
    isAfterExam: todayKey > examDateKey,
  };
}

export type PhaseGroup = {
  phase: PhaseId;
  weeks: WeekPlan[];
  nodeCount: number;
};

/** 단계별로 주를 묶는다. 주가 하나도 없는 단계는 빼고, 단계 순서를 지킨다. */
export function groupWeeksByPhase(weeks: WeekPlan[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  for (const week of weeks) {
    const last = groups[groups.length - 1];
    if (last && last.phase === week.phase) {
      last.weeks.push(week);
      last.nodeCount += week.nodeIds.length;
      continue;
    }
    groups.push({ phase: week.phase, weeks: [week], nodeCount: week.nodeIds.length });
  }
  return groups;
}

/** "8월 10일 ~ 8월 16일" */
export function formatWeekRange(week: WeekPlan): string {
  const start = toDate(week.startDate);
  const end = toDate(week.endDate);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
}
