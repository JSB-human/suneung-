import type { Rng } from "./rng.ts";

export type Subject = "korean" | "english" | "math";

export type Level = 1 | 2 | 3;

export type Choice = {
  value: string;
  label: string;
  mistakeTag?: string;
};

export type QuestionBody = {
  prompt: string;
  inputLabel: string;
  choices?: Choice[];
  acceptableAnswers: string[];
  steps: string[];
  hints: [string, string, string];
};

export type GeneratedQuestion = QuestionBody & {
  skillId: string;
  seed: number;
  level: Level;
};

export type QuestionGenerator = (rng: Rng, level: Level) => QuestionBody;
