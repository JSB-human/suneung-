import type { Subject } from "./types.ts";

export type SkillMapEntry = {
  skillId: string;
  subject: Subject;
  label: string;
  targetSeconds: number;
  coreNoteId?: string;
  foundationId?: string;
  conceptId?: string;
};

export const SKILL_MAP: Record<string, SkillMapEntry> = {
  "ma-frac-arith": {
    skillId: "ma-frac-arith",
    subject: "math",
    label: "분수 사칙연산",
    targetSeconds: 60,
    coreNoteId: "ma-number",
    foundationId: "ma-number-arithmetic",
    conceptId: "fraction-ratio-percent",
  },
  "ma-linear-eq": {
    skillId: "ma-linear-eq",
    subject: "math",
    label: "일차방정식",
    targetSeconds: 50,
    coreNoteId: "ma-linear",
    foundationId: "ma-equations",
    conceptId: "linear-equations",
  },
  "ma-poly-expand": {
    skillId: "ma-poly-expand",
    subject: "math",
    label: "다항식 전개",
    targetSeconds: 60,
    coreNoteId: "ma-identity",
    foundationId: "ma-identities-factoring",
    conceptId: "polynomial-expansion-factorization",
  },
  "ma-factor": {
    skillId: "ma-factor",
    subject: "math",
    label: "인수분해",
    targetSeconds: 70,
    coreNoteId: "ma-factor",
    foundationId: "ma-identities-factoring",
    conceptId: "polynomial-expansion-factorization",
  },
  "ma-quad-eq": {
    skillId: "ma-quad-eq",
    subject: "math",
    label: "이차방정식",
    targetSeconds: 80,
    coreNoteId: "ma-quadratic-equation",
    foundationId: "ma-equations",
    conceptId: "equation-inequality-bridge",
  },
};

export function getSkillsForConcept(conceptId: string): string[] {
  return Object.values(SKILL_MAP)
    .filter((entry) => entry.conceptId === conceptId)
    .map((entry) => entry.skillId);
}

export function getSkillEntry(skillId: string): SkillMapEntry | null {
  return SKILL_MAP[skillId] ?? null;
}
