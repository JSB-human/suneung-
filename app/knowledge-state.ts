/**
 * 지식 지도 진행 상태.
 *
 * 이 값을 채우던 화면(`LanguageKnowledgeMap`, `MathKnowledgeMap`)은 길(path)로
 * 대체되면서 사라졌다. 그런데 값 자체는 지우지 않는다 — 동생의 저장 데이터에
 * 예전에 쌓인 값이 남아 있을 수 있고, localStorage 말고는 백업이 없다.
 *
 * 그래서 화면은 지우되 저장 구조는 그대로 둔다. 새로 쌓이지는 않지만 이미
 * 쌓인 것은 점수에 계속 반영된다.
 */

export type KnowledgeProgressValue = {
  completedConceptIds: string[];
  correctQuestionIds: string[];
};

/** 국어·영어 지식 지도 값. 과목별로 하나씩 둔다. */
export type LanguageKnowledgeMapValue = KnowledgeProgressValue;

/** 수학 지식 지도 값. */
export type MathKnowledgeMapValue = KnowledgeProgressValue;

export const createEmptyLanguageKnowledgeMapValue = (): LanguageKnowledgeMapValue => ({
  completedConceptIds: [],
  correctQuestionIds: [],
});

export const createEmptyMathKnowledgeMapValue = (): MathKnowledgeMapValue => ({
  completedConceptIds: [],
  correctQuestionIds: [],
});
