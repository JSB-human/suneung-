import { addDays } from "../practice/review-queue.ts";
import type { MikuEvent } from "./miku-lines.ts";

/**
 * 스펙의 다섯 기분. 이 파일은 UI를 모르고, 시각조차 인자로 받는다.
 * (렌더 중 `new Date()`를 부르면 react-hooks/purity에 걸린다.)
 */
export type MikuMood = "cheerful" | "encouraging" | "proud" | "worried" | "sleepy";

export type MikuMoodInput = {
  /** 0~23 지역 시각. 호출부가 이벤트 핸들러나 이펙트에서 읽어 넘긴다. */
  hour: number;
  /** 오늘 포함 최근 7일 중 실제로 공부한 날 수 (0~7). */
  activeDaysLast7: number;
  /** 오늘 푼 문제 수. */
  todayAnswered: number;
  /** 오늘 맞힌 문제 수. */
  todayCorrect: number;
  /** 연속 학습일. */
  streakDays: number;
};

export type GreetingInput = {
  todayKey: string;
  lastSeenDate: string | null;
  hour: number;
};

/** 이 시각부터는 성과와 무관하게 sleepy다. */
const LATE_NIGHT_FROM_HOUR = 23;
/** 이 시각 전까지도 마찬가지. 23시 ~ 04시가 늦은 밤이다. */
const LATE_NIGHT_UNTIL_HOUR = 5;
/** 이 문항 수를 넘겨야 오늘 정답률을 신호로 취급한다. 1~2문제로 기분을 정하면 잘못 짚는다. */
const MIN_ACCURACY_SAMPLE = 3;
/** 이 아래로 떨어지면 걱정한다. */
const WORRIED_ACCURACY = 0.4;
/** 이 위면 잘 굴러가는 중이다. */
const CHEERFUL_ACCURACY = 0.6;
/** 뿌듯해하려면 이 정답률과 연속 학습일이 함께 필요하다. */
const PROUD_ACCURACY = 0.8;
const PROUD_STREAK_DAYS = 3;
/** 오늘 아직 안 풀었어도, 최근에 이만큼 자주 왔으면 기분이 좋다. */
const CHEERFUL_ACTIVE_DAYS = 4;
/** 이 이하로 왔으면 발길이 끊긴 것으로 본다. */
const WORRIED_ACTIVE_DAYS = 1;

const ACTIVE_WINDOW_DAYS = 7;

function normaliseHour(hour: number): number {
  if (!Number.isFinite(hour)) {
    return 12;
  }
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

function toCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function isLateNight(hour: number): boolean {
  const normalised = normaliseHour(hour);
  return normalised >= LATE_NIGHT_FROM_HOUR || normalised < LATE_NIGHT_UNTIL_HOUR;
}

/**
 * 기분 계산. 순서가 규칙이다.
 *
 * 1. 늦은 밤·새벽이면 무조건 `sleepy`. 성과를 보지 않는다.
 * 2. 최근 7일 중 공부한 날이 1일 이하이거나, 오늘 3문제 이상 풀었는데 정답률이
 *    40% 미만이면 `worried`.
 * 3. 연속 3일 이상 + 오늘 3문제 이상 + 정답률 80% 이상이면 `proud`.
 * 4. 오늘 정답률 60% 이상, 또는 아직 안 풀었어도 최근 7일 중 4일 이상 왔으면 `cheerful`.
 * 5. 나머지는 `encouraging`.
 */
export function computeMikuMood(input: MikuMoodInput): MikuMood {
  if (isLateNight(input.hour)) {
    return "sleepy";
  }

  const activeDays = Math.min(ACTIVE_WINDOW_DAYS, toCount(input.activeDaysLast7));
  const answered = toCount(input.todayAnswered);
  const correct = Math.min(answered, toCount(input.todayCorrect));
  const streakDays = toCount(input.streakDays);

  const hasSample = answered >= MIN_ACCURACY_SAMPLE;
  const accuracy = answered > 0 ? correct / answered : 0;

  if (activeDays <= WORRIED_ACTIVE_DAYS) {
    return "worried";
  }
  if (hasSample && accuracy < WORRIED_ACCURACY) {
    return "worried";
  }

  if (streakDays >= PROUD_STREAK_DAYS && hasSample && accuracy >= PROUD_ACCURACY) {
    return "proud";
  }

  if (hasSample && accuracy >= CHEERFUL_ACCURACY) {
    return "cheerful";
  }
  if (!hasSample && activeDays >= CHEERFUL_ACTIVE_DAYS) {
    return "cheerful";
  }

  return "encouraging";
}

/** 오늘 포함 최근 7일 중 학습 기록이 남은 날 수. */
export function countActiveDaysLast7(
  studyLog: Record<string, number>,
  todayKey: string,
): number {
  let count = 0;
  for (let offset = 0; offset < ACTIVE_WINDOW_DAYS; offset += 1) {
    const key = offset === 0 ? todayKey : addDays(todayKey, -offset);
    if ((studyLog[key] ?? 0) > 0) {
      count += 1;
    }
  }
  return count;
}

/** 이만큼 비면 복귀로 본다. */
const COMEBACK_GAP_DAYS = 3;

function daysBetween(from: string, to: string): number | null {
  const parse = (value: string) => {
    const parts = value.split("-").map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
      return null;
    }
    return Date.UTC(parts[0], parts[1] - 1, parts[2]);
  };
  const start = parse(from);
  const end = parse(to);
  if (start === null || end === null) {
    return null;
  }
  return Math.round((end - start) / 86_400_000);
}

/**
 * 접속 순간에 어떤 인사를 할지 고른다. 늦은 밤이 가장 우선이고,
 * 그다음이 복귀, 그다음이 오늘 첫 접속이다.
 */
export function resolveGreetingEvent(input: GreetingInput): MikuEvent {
  if (isLateNight(input.hour)) {
    return "lateNight";
  }

  if (input.lastSeenDate) {
    const gap = daysBetween(input.lastSeenDate, input.todayKey);
    if (gap !== null && gap >= COMEBACK_GAP_DAYS) {
      return "comeback";
    }
    if (gap !== null && gap <= 0) {
      return "sessionStart";
    }
  }

  return "dailyFirst";
}
