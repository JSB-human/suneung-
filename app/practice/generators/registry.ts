import { createRng } from "../rng.ts";
import type { GeneratedQuestion, Level, QuestionGenerator } from "../types.ts";
import { MATH_GENERATORS } from "./math.ts";

const GENERATORS: Record<string, QuestionGenerator> = {
  ...MATH_GENERATORS,
};

export function listSkillIds(): string[] {
  return Object.keys(GENERATORS);
}

export function hasSkill(skillId: string): boolean {
  return Object.prototype.hasOwnProperty.call(GENERATORS, skillId);
}

export function generateQuestion(
  skillId: string,
  seed: number,
  level: Level,
): GeneratedQuestion {
  const generator = GENERATORS[skillId];
  if (!generator) {
    throw new Error(`unknown skillId: ${skillId}`);
  }

  const body = generator(createRng(seed), level);
  return { ...body, skillId, seed, level };
}
