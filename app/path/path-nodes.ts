import { FOUNDATION_REFERENCE, type FoundationCapsule } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { SKILL_MAP } from "../practice/skill-map.ts";
import type { Subject } from "../practice/types.ts";
import { FORMULA_MAP } from "./formula-map.ts";
import { getPatternNodes } from "./pattern-nodes.ts";
import type { PathNode } from "./types.ts";

const SUBJECTS: Subject[] = ["korean", "english", "math"];

// 과목별 캡슐 순서를 파일 순서와 다르게 강제하고 싶을 때 여기에 등록한다.
// 나열된 캡슐은 이 순서대로, 나열되지 않은 캡슐은 원래 파일 순서를 유지한 채 뒤에 붙는다.
// 개념(concept) 노드는 이 매핑의 영향을 받지 않는다 — 개념 순서는 커리큘럼 챕터 구조를 그대로 따른다.
const CAPSULE_ORDER: Partial<Record<Subject, string[]>> = {
  english: [
    "en-vocabulary",
    "en-sv-skeleton",
    "en-listening-preview",
    "en-listening-flow",
    "en-modifiers",
    "en-clauses",
    "en-participles",
    "en-relatives",
    "en-reading-logic",
    "en-question-types",
    "en-grammar-check",
  ],
};

function orderCapsules(subject: Subject, capsules: FoundationCapsule[]): FoundationCapsule[] {
  const order = CAPSULE_ORDER[subject];
  if (!order) {
    return capsules;
  }
  const rank = new Map(order.map((sourceId, index) => [sourceId, index]));
  return capsules
    .map((capsule, index) => ({ capsule, index }))
    .sort((a, b) => {
      const rankA = rank.get(a.capsule.id) ?? Number.MAX_SAFE_INTEGER;
      const rankB = rank.get(b.capsule.id) ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.index - b.index;
    })
    .map(({ capsule }) => capsule);
}

function findSkillId(sourceId: string): string | undefined {
  const entry = Object.values(SKILL_MAP).find(
    (skill) => skill.foundationId === sourceId || skill.conceptId === sourceId,
  );
  return entry?.skillId;
}

function buildSubjectNodes(subject: Subject): PathNode[] {
  const nodes: PathNode[] = [];
  const seen = new Set<string>();

  const push = (
    sourceId: string,
    kind: PathNode["kind"],
    title: string,
    summary: string,
  ): void => {
    if (seen.has(sourceId)) {
      return;
    }
    seen.add(sourceId);
    nodes.push({
      id: `${kind}:${sourceId}`,
      subject,
      order: nodes.length + 1,
      title,
      summary,
      kind,
      sourceId,
      formulaNoteId: FORMULA_MAP[sourceId],
      skillId: findSkillId(sourceId),
    });
  };

  const subjectCapsules = FOUNDATION_REFERENCE.filter((capsule) => capsule.subject === subject);
  for (const capsule of orderCapsules(subject, subjectCapsules)) {
    push(capsule.id, "capsule", capsule.title, capsule.beginnerExplanation);
  }

  if (subject === "math") {
    for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          push(concept.id, "concept", concept.title, concept.summary);
        }
      }
    }
  } else {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          push(concept.id, "concept", concept.title, concept.summary);
        }
      }
    }
  }

  // 유형 칸은 개념을 다 배운 뒤에 온다. 개념을 모르면 유형을 봐도 못 푼다.
  for (const pattern of getPatternNodes(subject)) {
    push(pattern.id, "pattern", pattern.title, pattern.summary);
  }

  return nodes;
}

export const PATH_NODES: PathNode[] = SUBJECTS.flatMap(buildSubjectNodes);

const NODE_BY_ID = new Map(PATH_NODES.map((node) => [node.id, node]));

export function getNode(nodeId: string): PathNode | null {
  return NODE_BY_ID.get(nodeId) ?? null;
}

export function getNodesForSubject(subject: Subject): PathNode[] {
  return PATH_NODES.filter((node) => node.subject === subject);
}
