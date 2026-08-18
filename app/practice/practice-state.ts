import { mapOutcomeToRating } from "./grading.ts";
import {
  applyRating,
  createInitialProgress,
  parseKey,
  skillKey,
  vocabKey,
  type ReviewProgress,
} from "./review-queue.ts";
import type { Level } from "./types.ts";

export const MAX_WRONG_NOTES = 100;

export type WrongNote = {
  skillId: string;
  seed: number;
  level: Level;
  mistakeTag: string | null;
  at: string;
};

/** 스킬별 누적 성적. 늘고 있는지 판단하려면 시도 수와 정답 수가 필요하다. */
export type SkillStat = {
  attempts: number;
  correct: number;
};

export type PracticeState = {
  reviewById: Record<string, ReviewProgress>;
  wrongNotes: WrongNote[];
  skillLevels: Record<string, Level>;
  skillStats: Record<string, SkillStat>;
};

export const EMPTY_PRACTICE_STATE: PracticeState = {
  reviewById: {},
  wrongNotes: [],
  skillLevels: {},
  skillStats: {},
};

export type PracticeOutcome = {
  skillId: string;
  seed: number;
  level: Level;
  isCorrect: boolean;
  mistakeTag: string | null;
  hintsUsed: number;
  elapsedSeconds: number;
  targetSeconds: number;
  today: string;
};

function isLevel(value: unknown): value is Level {
  return value === 1 || value === 2 || value === 3;
}

function normalizeProgress(value: unknown): ReviewProgress | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<ReviewProgress>;
  const fallback = createInitialProgress();
  return {
    status:
      candidate.status === "learning" ||
      candidate.status === "review" ||
      candidate.status === "completed"
        ? candidate.status
        : fallback.status,
    dueDate: typeof candidate.dueDate === "string" ? candidate.dueDate : null,
    lastReviewedAt:
      typeof candidate.lastReviewedAt === "string" ? candidate.lastReviewedAt : null,
    intervalDays: Number.isFinite(candidate.intervalDays)
      ? Number(candidate.intervalDays)
      : fallback.intervalDays,
    reviewCount: Number.isFinite(candidate.reviewCount)
      ? Number(candidate.reviewCount)
      : fallback.reviewCount,
    streak: Number.isFinite(candidate.streak) ? Number(candidate.streak) : fallback.streak,
    favorite: candidate.favorite === true,
    ease: Number.isFinite(candidate.ease) ? Number(candidate.ease) : fallback.ease,
    mastery: Number.isFinite(candidate.mastery) ? Number(candidate.mastery) : fallback.mastery,
  };
}

function normalizeWrongNote(value: unknown): WrongNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<WrongNote>;
  if (typeof candidate.skillId !== "string" || !candidate.skillId) {
    return null;
  }
  if (!Number.isFinite(candidate.seed)) {
    return null;
  }
  return {
    skillId: candidate.skillId,
    seed: Number(candidate.seed),
    level: isLevel(candidate.level) ? candidate.level : 1,
    mistakeTag: typeof candidate.mistakeTag === "string" ? candidate.mistakeTag : null,
    at: typeof candidate.at === "string" ? candidate.at : "",
  };
}

export function normalizePracticeState(value: unknown): PracticeState {
  if (!value || typeof value !== "object") {
    return EMPTY_PRACTICE_STATE;
  }

  const candidate = value as Partial<PracticeState>;

  const reviewById: Record<string, ReviewProgress> = {};
  if (candidate.reviewById && typeof candidate.reviewById === "object") {
    for (const [key, rawProgress] of Object.entries(candidate.reviewById)) {
      if (!parseKey(key)) {
        continue;
      }
      const progress = normalizeProgress(rawProgress);
      if (progress) {
        reviewById[key] = progress;
      }
    }
  }

  const wrongNotes = Array.isArray(candidate.wrongNotes)
    ? candidate.wrongNotes
        .map(normalizeWrongNote)
        .filter((note): note is WrongNote => note !== null)
        .slice(0, MAX_WRONG_NOTES)
    : [];

  const skillLevels: Record<string, Level> = {};
  if (candidate.skillLevels && typeof candidate.skillLevels === "object") {
    for (const [skillId, level] of Object.entries(candidate.skillLevels)) {
      if (isLevel(level)) {
        skillLevels[skillId] = level;
      }
    }
  }

  const skillStats: Record<string, SkillStat> = {};
  const rawStats = (candidate as { skillStats?: unknown }).skillStats;
  if (rawStats && typeof rawStats === "object") {
    for (const [skillId, value] of Object.entries(rawStats as Record<string, unknown>)) {
      if (!value || typeof value !== "object") {
        continue;
      }
      const stat = value as Partial<SkillStat>;
      const attempts = Number.isFinite(stat.attempts) ? Math.max(0, Number(stat.attempts)) : 0;
      const correct = Number.isFinite(stat.correct) ? Math.max(0, Number(stat.correct)) : 0;
      if (attempts > 0) {
        // 맞힌 수가 시도 수를 넘을 수는 없다. 저장된 값이 깨졌으면 잘라 낸다.
        skillStats[skillId] = { attempts, correct: Math.min(correct, attempts) };
      }
    }
  }

  return { reviewById, wrongNotes, skillLevels, skillStats };
}

export function migrateVocabIntoReview(
  vocabProgressById: Record<string, unknown>,
  existing: Record<string, ReviewProgress>,
): Record<string, ReviewProgress> {
  const merged: Record<string, ReviewProgress> = { ...existing };
  for (const [wordId, rawProgress] of Object.entries(vocabProgressById ?? {})) {
    const key = vocabKey(wordId);
    if (merged[key]) {
      continue;
    }
    const progress = normalizeProgress(rawProgress);
    if (progress) {
      merged[key] = progress;
    }
  }
  return merged;
}

export function recordOutcome(state: PracticeState, outcome: PracticeOutcome): PracticeState {
  const key = skillKey(outcome.skillId);
  const rating = mapOutcomeToRating({
    isCorrect: outcome.isCorrect,
    hintsUsed: outcome.hintsUsed,
    elapsedSeconds: outcome.elapsedSeconds,
    targetSeconds: outcome.targetSeconds,
  });

  const reviewById = {
    ...state.reviewById,
    [key]: applyRating(state.reviewById[key] ?? null, rating, outcome.today),
  };

  const previousStat = state.skillStats[outcome.skillId] ?? { attempts: 0, correct: 0 };
  const skillStats = {
    ...state.skillStats,
    [outcome.skillId]: {
      attempts: previousStat.attempts + 1,
      correct: previousStat.correct + (outcome.isCorrect ? 1 : 0),
    },
  };

  if (outcome.isCorrect) {
    return { ...state, reviewById, skillStats };
  }

  const note: WrongNote = {
    skillId: outcome.skillId,
    seed: outcome.seed,
    level: outcome.level,
    mistakeTag: outcome.mistakeTag,
    at: outcome.today,
  };

  const withoutDuplicate = state.wrongNotes.filter(
    (existing) => !(existing.skillId === note.skillId && existing.seed === note.seed),
  );

  return {
    ...state,
    reviewById,
    skillStats,
    wrongNotes: [note, ...withoutDuplicate].slice(0, MAX_WRONG_NOTES),
  };
}


/** 오답 태그를 사람이 읽는 말로. 태그 이름을 그대로 보여 주면 아무 의미가 없다. */
export const MISTAKE_LABELS: Record<string, string> = {
  "sign-transpose": "이항할 때 부호",
  "no-divide": "계수로 나누기 빼먹음",
  "sign-flip": "부호 반대로",
  "off-by-one": "하나 차이",
  "missing-cross": "가운데 항 빠뜨림",
  "constant-sign": "상수항 부호",
  "middle-sign": "가운데 항 부호",
  "cross-add-only": "곱하지 않고 더함",
  "square-confusion": "합차공식과 완전제곱 혼동",
  "constant-add": "상수항을 더함",
  "both-signs": "두 인수 부호 모두",
  "one-sign": "한쪽 인수 부호",
  "sum-only": "합만 맞춘 짝",
  "root-sign": "근의 부호",
  "one-root-sign": "한쪽 근의 부호",
  "factor-pair": "인수 짝 잘못",
  "denominator-shortcut": "분모를 그냥 계산",
  sign: "부호",
  "cross-error": "분자·분모 엇갈림",
  "not-reduced": "약분 안 함",
  "near-miss": "아깝게 빗나감",
};

export type MistakeSummary = {
  tag: string;
  label: string;
  count: number;
};

/**
 * 최근 오답에서 실수 유형을 세어 많은 순으로 돌려준다.
 *
 * 오답노트가 최근 100건 링버퍼라 "요즘 뭘 자주 틀리는지"가 나온다.
 * 평생 누적보다 이쪽이 지금 고칠 것을 고르는 데 맞다.
 */
export function summarizeMistakes(state: PracticeState): MistakeSummary[] {
  const counts = new Map<string, number>();
  for (const note of state.wrongNotes) {
    if (!note.mistakeTag) {
      continue;
    }
    counts.set(note.mistakeTag, (counts.get(note.mistakeTag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, label: MISTAKE_LABELS[tag] ?? tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag));
}

/** 스킬 정답률. 아직 푼 적이 없으면 null - 0%로 보여 주면 못한다는 뜻이 되어 버린다. */
export function getSkillAccuracy(state: PracticeState, skillId: string): number | null {
  const stat = state.skillStats[skillId];
  if (!stat || stat.attempts === 0) {
    return null;
  }
  return stat.correct / stat.attempts;
}
