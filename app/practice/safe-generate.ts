import { generateQuestion } from "./generators/registry.ts";
import { findQuestionViolations } from "./question-invariants.ts";
import type { GeneratedQuestion, Level } from "./types.ts";

const MAX_GENERATION_ATTEMPTS = 5;

export function generateSafely(
  skillId: string,
  level: Level,
  seed?: number,
): GeneratedQuestion | null {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const nextSeed = seed ?? Math.floor(Math.random() * 1_000_000);
    try {
      const question = generateQuestion(skillId, nextSeed, level);
      if (findQuestionViolations(question).length === 0) {
        return question;
      }
    } catch {
      // 다음 시드로 재시도한다. 한 문항의 실패가 학습 전체를 막지 않게 한다.
    }
    if (seed !== undefined) {
      break;
    }
  }
  return null;
}
