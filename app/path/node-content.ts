import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { CORE_NOTES } from "../study-content.ts";
import { NODE_QUESTIONS } from "./node-questions.ts";
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

// 칸의 확인 문제 = 원본 콘텐츠에 딸린 기본 문항 + node-questions.ts에서 집필한 추가 문항.
// 순서를 유지해야 학습자가 늘 같은 문제부터 만난다.
function withAuthoredQuestions(nodeId: string, builtIn: NodeQuestion[]): NodeQuestion[] {
  const authored = NODE_QUESTIONS[nodeId];
  if (!authored || authored.length === 0) {
    return builtIn;
  }
  return [...builtIn, ...authored.map((question) => ({ ...question, choices: [...question.choices] }))];
}

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
      questions: withAuthoredQuestions(nodeId, [
        {
          id: `${nodeId}:quick`,
          prompt: capsule.quickCheck.prompt,
          choices: [],
          answer: capsule.quickCheck.answer,
          explanation: capsule.quickCheck.explanation,
        },
      ]),
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
      questions: withAuthoredQuestions(nodeId, [
        {
          id: check.id,
          prompt: check.prompt,
          choices: check.choices ? [...check.choices] : [],
          answer: check.acceptableAnswers[0] ?? check.answer,
          explanation: check.explanation,
        },
      ]),
    };
  }

  const mathConcept = findMathConcept(node.sourceId);
  if (mathConcept) {
    return {
      ...base,
      explanation: mathConcept.summary,
      keyPoints:
        base.keyPoints.length > 0 ? base.keyPoints : [...mathConcept.corePrinciples],
      questions: withAuthoredQuestions(
        nodeId,
        mathConcept.practiceQuestions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          choices: question.choices ? [...question.choices] : [],
          answer: question.acceptableAnswers[0],
          explanation: question.explanation,
        })),
      ),
    };
  }

  return null;
}
