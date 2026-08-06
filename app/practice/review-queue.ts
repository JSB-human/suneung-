import type { Rating } from "./types.ts";

export type ReviewStage = "new" | "learning" | "review" | "completed";

export type ReviewProgress = {
  status: ReviewStage;
  dueDate: string | null;
  lastReviewedAt: string | null;
  intervalDays: number;
  reviewCount: number;
  streak: number;
  favorite: boolean;
  ease: number;
  mastery: number;
};

export type ReviewKind = "vocab" | "skill";

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(baseDateKey: string, days: number): string {
  const [year, month, day] = baseDateKey.split("-").map((value) => Number(value));
  const nextDate = new Date(year, month - 1, day);
  nextDate.setDate(nextDate.getDate() + days);
  return getLocalDateKey(nextDate);
}

export function createInitialProgress(): ReviewProgress {
  return {
    status: "new",
    dueDate: null,
    lastReviewedAt: null,
    intervalDays: 0,
    reviewCount: 0,
    streak: 0,
    favorite: false,
    ease: 2.3,
    mastery: 0,
  };
}

export function isDue(progress: ReviewProgress | null, today: string): boolean {
  if (!progress) {
    return true;
  }
  if (!progress.dueDate) {
    return progress.status !== "completed";
  }
  return progress.dueDate <= today;
}

export function vocabKey(wordId: string): string {
  return `vocab:${wordId}`;
}

export function skillKey(skillId: string): string {
  return `skill:${skillId}`;
}

export function parseKey(key: string): { kind: ReviewKind; id: string } | null {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }
  const prefix = key.slice(0, separatorIndex);
  const id = key.slice(separatorIndex + 1);
  if (!id) {
    return null;
  }
  if (prefix !== "vocab" && prefix !== "skill") {
    return null;
  }
  return { kind: prefix, id };
}

export function applyRating(
  previous: ReviewProgress | null,
  rating: Rating,
  today: string,
): ReviewProgress {
  const baseline = previous ?? createInitialProgress();
  const reviewCount = baseline.reviewCount + 1;
  const favorite = baseline.favorite;

  if (rating === "again") {
    return {
      ...baseline,
      status: "learning",
      dueDate: today,
      lastReviewedAt: today,
      intervalDays: 0,
      reviewCount,
      streak: 0,
      favorite,
      ease: Math.max(1.3, baseline.ease - 0.2),
      mastery: Math.max(0, baseline.mastery - 15),
    };
  }

  if (rating === "hard") {
    const intervalDays = baseline.intervalDays <= 0 ? 1 : Math.min(baseline.intervalDays + 1, 10);
    const mastery = Math.min(100, baseline.mastery + 8);
    return {
      ...baseline,
      status: reviewCount >= 2 ? "review" : "learning",
      dueDate: addDays(today, intervalDays),
      lastReviewedAt: today,
      intervalDays,
      reviewCount,
      streak: baseline.streak + 1,
      favorite,
      ease: Math.max(1.4, baseline.ease - 0.05),
      mastery,
    };
  }

  if (rating === "good") {
    const intervalDays =
      baseline.intervalDays <= 0 ? 3 : Math.min(Math.max(baseline.intervalDays + 3, 3), 21);
    const mastery = Math.min(100, baseline.mastery + 16);
    return {
      ...baseline,
      status: mastery >= 70 || reviewCount >= 4 ? "completed" : "review",
      dueDate: addDays(today, intervalDays),
      lastReviewedAt: today,
      intervalDays,
      reviewCount,
      streak: baseline.streak + 1,
      favorite,
      ease: Math.min(3.0, baseline.ease + 0.05),
      mastery,
    };
  }

  const intervalDays =
    baseline.intervalDays <= 0 ? 7 : Math.min(Math.max(baseline.intervalDays * 2, 7), 45);
  const mastery = Math.min(100, baseline.mastery + 24);
  return {
    ...baseline,
    status: mastery >= 60 || reviewCount >= 3 ? "completed" : "review",
    dueDate: addDays(today, intervalDays),
    lastReviewedAt: today,
    intervalDays,
    reviewCount,
    streak: baseline.streak + 1,
    favorite,
    ease: Math.min(3.2, baseline.ease + 0.15),
    mastery,
  };
}

export function listDueKeys(
  progressById: Record<string, ReviewProgress>,
  today: string,
  kind?: ReviewKind,
): string[] {
  return Object.entries(progressById)
    .filter(([key, progress]) => {
      const parsed = parseKey(key);
      if (!parsed) {
        return false;
      }
      if (kind && parsed.kind !== kind) {
        return false;
      }
      return isDue(progress, today);
    })
    .sort(([, left], [, right]) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))
    .map(([key]) => key);
}
