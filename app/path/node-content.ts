import { findLesson } from "../foundation-lessons.ts";
import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { CORE_NOTES, SUBJECT_MEDIA_LINKS } from "../study-content.ts";
import { NODE_QUESTIONS } from "./node-questions.ts";
import { findPatternNode } from "./pattern-nodes.ts";
import { getNode } from "./path-nodes.ts";
import type { FoundationLesson } from "../foundation-lesson-types.ts";
import type { Subject } from "../practice/types.ts";
import type { NodeQuestion } from "./types.ts";

export type NodeLink = {
  title: string;
  href: string;
  note?: string;
};

/**
 * 과목 단위 강좌·채널 링크. 기초 캡슐 칸에는 자기 링크가 없으므로 이것만 붙는다.
 *
 * `CORE_NOTES`의 `ebsUrl`·`youtubeChannelUrl`은 타입에만 선언돼 있고 값이 하나도
 * 채워져 있지 않아 쓸 수 없다. 실제 링크는 여기와 커리큘럼의 `resources`에 있다.
 */
function subjectLinks(subject: Subject): NodeLink[] {
  const media = SUBJECT_MEDIA_LINKS[subject];
  if (!media) {
    return [];
  }
  return [
    { title: media.ebsTitle, href: media.ebsUrl, note: "EBSi 공식 강좌" },
    { title: media.youtubeChannelTitle, href: media.youtubeChannelUrl, note: "유튜브 강의" },
  ];
}

/** 커리큘럼 개념에 붙은 링크를 과목 링크 앞에 놓는다. 더 정확한 자료가 먼저 보여야 한다. */
function withConceptLinks(
  resources: ReadonlyArray<{ title: string; href: string; note?: string }> | undefined,
  fallback: NodeLink[],
): NodeLink[] {
  const own = (resources ?? []).map((item) => ({
    title: item.title,
    href: item.href,
    note: item.note,
  }));
  const seen = new Set(own.map((item) => item.href));
  return [...own, ...fallback.filter((item) => !seen.has(item.href))];
}

export type NodeContent = {
  nodeId: string;
  title: string;
  explanation: string;
  keyPoints: string[];
  formula?: string;
  mistake?: string;
  questions: NodeQuestion[];
  skillId?: string;
  /** 칸 맨 아래 "더 보기"에 접어 두는 EBS·유튜브 링크. */
  links: NodeLink[];
  /** 짧은 요약으로 부족한 칸에 붙는 자세한 강의. 없는 칸도 있다. */
  lesson?: FoundationLesson;
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
    links: subjectLinks(node.subject),
  };

  if (node.kind === "pattern") {
    const pattern = findPatternNode(node.sourceId);
    if (!pattern) {
      return null;
    }
    return {
      ...base,
      explanation: pattern.explanation,
      keyPoints: [...pattern.keyPoints],
      // 유형 칸에는 공식이 없다. 대신 "먼저 볼 것"이 그 자리를 대신한다.
      formula: undefined,
      mistake: pattern.mistake,
      questions: withAuthoredQuestions(
        nodeId,
        pattern.questions.map((question) => ({ ...question, choices: [...question.choices] })),
      ),
    };
  }

  if (node.kind === "capsule") {
    const capsule = findCapsule(node.sourceId);
    if (!capsule) {
      return null;
    }
    return {
      ...base,
      explanation: capsule.beginnerExplanation,
      lesson: findLesson(capsule.id),
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
      links: withConceptLinks(languageConcept.resources, base.links),
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
      links: withConceptLinks(mathConcept.resources, base.links),
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
