/**
 * 노드(캡슐/개념) → 요점 카드(CORE_NOTES) 연결표.
 *
 * 손으로 작성한 유일한 데이터다. 같은 과목 안에서만 연결했고, 어울리는 노트가
 * 없으면 넣지 않았다 (억지로 연결하면 엉뚱한 공식이 뜬다). `SKILL_MAP`에 이미
 * `coreNoteId`가 있던 5개 스킬의 연결(분수, 일차방정식, 다항식 전개/인수분해,
 * 이차방정식)은 그대로 재사용했다.
 */
export const FORMULA_MAP: Record<string, string> = {
  // --- 수학 ---
  "ma-number-arithmetic": "ma-number",
  "fraction-ratio-percent": "ma-number",
  "signed-number-operations": "ma-number",
  "ma-equations": "ma-linear",
  "linear-equations": "ma-linear",
  "ma-identities-factoring": "ma-factor",
  "polynomial-expansion-factorization": "ma-identity",
  "equation-inequality-bridge": "ma-quadratic-equation",
  "ma-expressions": "ma-expression",
  "variables-and-expressions": "ma-expression",
  "linear-function-slope": "ma-linear-function",
  "ma-functions-graphs": "ma-linear-function",
  "pythagorean-and-area": "ma-geometry",
  "counting-principles": "ma-counting",
  "simple-probability": "ma-counting",
  "ma-counting-probability": "ma-counting",

  // --- 국어 ---
  "ko-sentence-skeleton": "ko-sentence",
  "korean-sentence": "ko-sentence",
  "ko-nonfiction-structure": "ko-structure",
  "korean-main-sentence": "ko-structure",
  "ko-reference-terms": "ko-vocab-context",
  "ko-fact-inference": "ko-claim",
  "korean-humanities-reading": "ko-claim",
  "korean-science-tech-reading": "ko-process",
  "ko-poetry": "ko-poetry",
  "korean-modern-poetry": "ko-poetry",
  "korean-classical-poetry": "ko-classic",
  "ko-fiction": "ko-fiction",
  "korean-modern-fiction": "ko-fiction",
  "korean-classical-fiction": "ko-classic",
  "ko-grammar-levels": "ko-grammar",
  "korean-phonology": "ko-grammar",
  "korean-parts-of-speech": "ko-grammar",
  "ko-answer-evidence": "ko-options",
  "korean-problem-application": "ko-options",
  "korean-ebs-linkage": "ko-ebs-loop",

  // --- 영어 ---
  "en-sv-skeleton": "en-sv",
  "english-svo": "en-sv",
  "en-modifiers": "en-verbals",
  "english-nonfinite": "en-verbals",
  "en-participles": "en-verbals",
  "en-clauses": "en-clauses",
  "english-clauses": "en-clauses",
  "en-relatives": "en-relative",
  "english-parts-of-speech": "en-parts",
  "english-tense-voice": "en-tense-voice",
  "en-reading-logic": "en-linking",
  "english-connectors": "en-linking",
  "english-main-idea": "en-main-idea",
  "en-listening-preview": "en-listening",
  "en-listening-flow": "en-listening",
  "english-listening-purpose-relation": "en-listening",
  "english-listening-number-detail": "en-listening",
  "english-listening-inference": "en-listening",
  "english-listening-long-dialogue": "en-listening",
  "english-order-insertion": "en-linking",
  "english-ebs-linkage": "en-ebs-loop",
};
