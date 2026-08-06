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
  microPractice?: string;
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
    microPractice: note?.microPractice,
    // 기초 캡슐은 핵심 노트보다 넓은 단원을 다루므로 예제가 다른 연산일 때가
    // 많다. 실제로 일차방정식 스킬에 이차방정식 예제가, 전개 스킬에 인수분해
    // 예제가 붙어 있었다. 그래서 기본은 빌려 오지 않고, 캡슐 예제가 이 스킬과
    // 정말 같은 주제일 때만 skill-map에서 명시적으로 켠다.
    workedExample:
      !note || entry.useCapsuleExample ? capsule?.workedExample : undefined,
  };
}
