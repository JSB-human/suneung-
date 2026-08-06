import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { CORE_NOTES } from "../study-content.ts";
import { getSkillEntry } from "./skill-map.ts";

export type ConceptSource = {
  skillId: string;
  title: string;
  oneLine: string;
  keyPoints: string[];
  formula?: string;
  mistake: string;
  workedExample?: {
    prompt: string;
    process: string;
    result: string;
  };
};

export function resolveConceptSource(skillId: string): ConceptSource | null {
  const entry = getSkillEntry(skillId);
  if (!entry) {
    return null;
  }

  const note = entry.coreNoteId
    ? CORE_NOTES.find((item) => item.id === entry.coreNoteId)
    : undefined;
  const capsule = entry.foundationId
    ? FOUNDATION_REFERENCE.find((item) => item.id === entry.foundationId)
    : undefined;

  const keyPoints = note?.essentials ?? capsule?.keyPoints ?? [];
  if (!note && !capsule) {
    return null;
  }

  return {
    skillId,
    title: note?.title ?? capsule?.title ?? entry.label,
    oneLine: note?.oneLine ?? capsule?.beginnerExplanation ?? "",
    keyPoints: [...keyPoints],
    formula: note?.formula ?? capsule?.frame,
    mistake: note?.mistake ?? capsule?.commonTrap ?? "",
    workedExample: capsule?.workedExample,
  };
}
