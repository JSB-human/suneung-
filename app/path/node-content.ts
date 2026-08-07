import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { CORE_NOTES } from "../study-content.ts";
import { getNode } from "./path-nodes.ts";
import type { NodeQuestion } from "./types.ts";

export type NodeContent = {
  nodeId: string;
  title: string;
  explanation: string;
  keyPoints: string[];
  formula?: string;
  mistake?: string;
  questions: NodeQuestion[];
  skillId?: string;
};

function findCapsule(sourceId: string) {
  return FOUNDATION_REFERENCE.find((item) => item.id === sourceId);
}

function findLanguageConcept(sourceId: string) {
  for (const subject of ["korean", "english"] as const) {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          if (concept.id === sourceId) {
            return concept;
          }
        }
      }
    }
  }
  return undefined;
}

function findMathConcept(sourceId: string) {
  for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
    for (const unit of chapter.units) {
      for (const concept of unit.concepts) {
        if (concept.id === sourceId) {
          return concept;
        }
      }
    }
  }
  return undefined;
}

export function resolveNodeContent(nodeId: string): NodeContent | null {
  const node = getNode(nodeId);
  if (!node) {
    return null;
  }

  const note = node.formulaNoteId
    ? CORE_NOTES.find((item) => item.id === node.formulaNoteId)
    : undefined;

  const base = {
    nodeId,
    title: node.title,
    keyPoints: note?.essentials ? [...note.essentials] : [],
    formula: note?.formula,
    mistake: note?.mistake,
    skillId: node.skillId,
  };

  if (node.kind === "capsule") {
    const capsule = findCapsule(node.sourceId);
    if (!capsule) {
      return null;
    }
    return {
      ...base,
      explanation: capsule.beginnerExplanation,
      keyPoints: base.keyPoints.length > 0 ? base.keyPoints : [...capsule.keyPoints],
      formula: base.formula ?? capsule.frame,
      mistake: base.mistake ?? capsule.commonTrap,
      questions: [
        {
          id: `${nodeId}:quick`,
          prompt: capsule.quickCheck.prompt,
          choices: [],
          answer: capsule.quickCheck.answer,
          explanation: capsule.quickCheck.explanation,
        },
      ],
    };
  }

  const languageConcept = findLanguageConcept(node.sourceId);
  if (languageConcept) {
    const check = languageConcept.selfCheckQuestion;
    return {
      ...base,
      explanation: languageConcept.summary,
      keyPoints:
        base.keyPoints.length > 0 ? base.keyPoints : [...languageConcept.corePoints],
      questions: [
        {
          id: check.id,
          prompt: check.prompt,
          choices: check.choices ? [...check.choices] : [],
          answer: check.acceptableAnswers[0] ?? check.answer,
          explanation: check.explanation,
        },
      ],
    };
  }

  const mathConcept = findMathConcept(node.sourceId);
  if (mathConcept) {
    return {
      ...base,
      explanation: mathConcept.summary,
      keyPoints:
        base.keyPoints.length > 0 ? base.keyPoints : [...mathConcept.corePrinciples],
      questions: mathConcept.practiceQuestions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        choices: question.choices ? [...question.choices] : [],
        answer: question.acceptableAnswers[0],
        explanation: question.explanation,
      })),
    };
  }

  return null;
}
