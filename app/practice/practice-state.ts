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

export type PracticeState = {
  reviewById: Record<string, ReviewProgress>;
  wrongNotes: WrongNote[];
  skillLevels: Record<string, Level>;
};

export const EMPTY_PRACTICE_STATE: PracticeState = {
  reviewById: {},
  wrongNotes: [],
  skillLevels: {},
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

  return { reviewById, wrongNotes, skillLevels };
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

  if (outcome.isCorrect) {
    return { ...state, reviewById };
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
    wrongNotes: [note, ...withoutDuplicate].slice(0, MAX_WRONG_NOTES),
  };
}
