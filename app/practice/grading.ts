import type { GeneratedQuestion, Rating } from "./types.ts";

export type { Rating };

export type GradeResult = {
  isCorrect: boolean;
  mistakeTag: string | null;
};

export type Outcome = {
  isCorrect: boolean;
  hintsUsed: number;
  elapsedSeconds: number;
  targetSeconds: number;
};

const FAST_RATIO = 0.6;

export function normaliseAnswer(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

export function gradeAnswer(
  question: GeneratedQuestion,
  submitted: string,
): GradeResult {
  const normalised = normaliseAnswer(submitted);
  if (!normalised) {
    return { isCorrect: false, mistakeTag: null };
  }

  const isCorrect = question.acceptableAnswers.some(
    (answer) => normaliseAnswer(answer) === normalised,
  );
  if (isCorrect) {
    return { isCorrect: true, mistakeTag: null };
  }

  const matched = question.choices?.find(
    (choice) => normaliseAnswer(choice.value) === normalised,
  );
  return { isCorrect: false, mistakeTag: matched?.mistakeTag ?? null };
}

export function mapOutcomeToRating(outcome: Outcome): Rating {
  if (!outcome.isCorrect) {
    return "again";
  }
  if (outcome.hintsUsed > 0) {
    return "hard";
  }
  return outcome.elapsedSeconds <= outcome.targetSeconds * FAST_RATIO ? "easy" : "good";
}
