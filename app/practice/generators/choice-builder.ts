import type { Rng } from "../rng.ts";
import type { Choice } from "../types.ts";

export type DistractorCandidate = {
  value: string;
  mistakeTag: string;
};

const TOTAL_CHOICES = 4;

export function buildChoices(
  rng: Rng,
  correctValue: string,
  candidates: readonly DistractorCandidate[],
): Choice[] {
  const chosen: Choice[] = [{ value: correctValue, label: correctValue }];
  const used = new Set<string>([correctValue]);

  for (const candidate of candidates) {
    if (chosen.length >= TOTAL_CHOICES) {
      break;
    }
    const value = candidate.value.trim();
    if (!value || used.has(value)) {
      continue;
    }
    used.add(value);
    chosen.push({ value, label: value, mistakeTag: candidate.mistakeTag });
  }

  const numericBase = Number(correctValue);
  let offset = 1;
  while (chosen.length < TOTAL_CHOICES && offset < 60) {
    const value = Number.isFinite(numericBase)
      ? String(numericBase + (offset % 2 === 1 ? offset : -offset))
      : `${correctValue} (${offset})`;
    offset += 1;
    if (used.has(value)) {
      continue;
    }
    used.add(value);
    chosen.push({ value, label: value, mistakeTag: "near-miss" });
  }

  return rng.shuffle(chosen);
}
