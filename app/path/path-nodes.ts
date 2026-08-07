import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { SKILL_MAP } from "../practice/skill-map.ts";
import type { Subject } from "../practice/types.ts";
import { FORMULA_MAP } from "./formula-map.ts";
import type { PathNode } from "./types.ts";

const SUBJECTS: Subject[] = ["korean", "english", "math"];

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

  for (const capsule of FOUNDATION_REFERENCE) {
    if (capsule.subject === subject) {
      push(capsule.id, "capsule", capsule.title, capsule.beginnerExplanation);
    }
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
