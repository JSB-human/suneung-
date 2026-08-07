/**
 * 로드맵의 단계 정의.
 *
 * 이 파일이 로드맵에서 **손으로 쓰는 유일한 데이터**다.
 * 주별 계획은 여기 적힌 경계와 길(`path-nodes.ts`)에서 파생된다.
 */

export type PhaseId = "foundation" | "concept" | "pattern" | "final";

export type Phase = {
  id: PhaseId;
  name: string;
  /** 사람이 읽는 기간 표기 */
  period: string;
  /** 포함 (YYYY-MM-DD) */
  startDate: string;
  /** 포함 (YYYY-MM-DD) */
  endDate: string;
  /** 한 줄 설명 */
  focus: string;
  /** 이 단계에서 하루에 볼 단어 수 */
  vocabPerDay: number;
  /**
   * 이 단계에 새 길 칸을 배정해도 되는지.
   * 유형 적응·실전은 복습 구간이므로 새 개념을 넣지 않는다.
   */
  acceptsNewNodes: boolean;
};

/** 2028학년도 수능 */
export const EXAM_DATE_KEY = "2027-11-18";

export const PHASES: Phase[] = [
  {
    id: "foundation",
    name: "기초 다지기",
    period: "2026년 8월 ~ 12월",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    focus: "중학 내용을 되찾는 구간입니다. 기초 캡슐을 먼저 지나갑니다.",
    vocabPerDay: 10,
    acceptsNewNodes: true,
  },
  {
    id: "concept",
    name: "개념 완성",
    period: "2027년 1월 ~ 6월",
    startDate: "2027-01-01",
    endDate: "2027-06-30",
    focus: "개념 칸을 전부 지나가며 공식과 원리를 손에 익힙니다.",
    vocabPerDay: 15,
    acceptsNewNodes: true,
  },
  {
    id: "pattern",
    name: "유형 적응",
    period: "2027년 7월 ~ 9월",
    startDate: "2027-07-01",
    endDate: "2027-09-30",
    focus: "새 개념 없이 반복 연습과 오답 정리에 씁니다.",
    vocabPerDay: 20,
    acceptsNewNodes: false,
  },
  {
    id: "final",
    name: "실전",
    period: "2027년 10월 ~ 수능",
    startDate: "2027-10-01",
    endDate: EXAM_DATE_KEY,
    focus: "복습 큐만 돕니다. 새로 벌리지 않습니다.",
    vocabPerDay: 20,
    acceptsNewNodes: false,
  },
];

const PHASE_BY_ID = new Map(PHASES.map((phase) => [phase.id, phase]));

export function getPhase(id: PhaseId): Phase {
  const phase = PHASE_BY_ID.get(id);
  if (!phase) {
    return PHASES[0];
  }
  return phase;
}

/**
 * 날짜가 속한 단계. 첫 단계 이전이면 첫 단계, 마지막 단계 이후(수능 이후)면
 * 마지막 단계를 돌려준다 — 어떤 날짜를 넣어도 반드시 하나를 돌려준다.
 */
export function getPhaseForDate(dateKey: string): Phase {
  for (const phase of PHASES) {
    if (dateKey <= phase.endDate) {
      return phase;
    }
  }
  return PHASES[PHASES.length - 1];
}

/** 새 길 칸을 배정할 수 있는 마지막 날짜 */
export function getNewNodeHorizonDate(): string {
  const accepting = PHASES.filter((phase) => phase.acceptsNewNodes);
  if (accepting.length === 0) {
    return PHASES[PHASES.length - 1].endDate;
  }
  return accepting[accepting.length - 1].endDate;
}

/** 학습 시작일 — 진도가 앞섰는지 밀렸는지 재는 기준점 */
export function getCourseStartDate(): string {
  return PHASES[0].startDate;
}
