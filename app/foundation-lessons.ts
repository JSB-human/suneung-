import { ENGLISH_LESSONS } from "./foundation-lessons-english.ts";
import { KOREAN_LESSONS } from "./foundation-lessons-korean.ts";
import { MATH_LESSONS } from "./foundation-lessons-math.ts";
import type { FoundationLesson } from "./foundation-lesson-types.ts";

/**
 * 과목별 파일로 나눠 둔 이유는 여러 사람이 동시에 집필하기 위해서다.
 * 한 파일이면 서로의 편집을 덮어쓴다.
 */
export const FOUNDATION_LESSONS: FoundationLesson[] = [
  ...KOREAN_LESSONS,
  ...ENGLISH_LESSONS,
  ...MATH_LESSONS,
];

const BY_CAPSULE_ID = new Map(FOUNDATION_LESSONS.map((lesson) => [lesson.capsuleId, lesson]));

export function findLesson(capsuleId: string): FoundationLesson | undefined {
  return BY_CAPSULE_ID.get(capsuleId);
}
