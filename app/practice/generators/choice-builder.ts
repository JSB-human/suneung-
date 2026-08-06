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
  // Only numeric answers can be padded with a synthesised near miss. For a
  // non-numeric answer there is no way to invent a genuinely wrong option, so we
  // return the real distractors we have and let the caller's question invariants
  // reject the question rather than shipping a decorated copy of the answer.
  if (Number.isFinite(numericBase)) {
    let offset = 1;
    while (chosen.length < TOTAL_CHOICES && offset < 60) {
      const value = String(numericBase + (offset % 2 === 1 ? offset : -offset));
      offset += 1;
      if (used.has(value)) {
        continue;
      }
      used.add(value);
      chosen.push({ value, label: value, mistakeTag: "near-miss" });
    }
  }

  return rng.shuffle(chosen);
}
