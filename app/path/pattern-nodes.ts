import type { Subject } from "../practice/types.ts";
import type { NodeQuestion } from "./types.ts";

/**
 * 수능에 실제로 나오는 문제 유형 한 가지.
 *
 * 개념 칸이 "무엇을 아는가"라면 유형 칸은 "그게 시험에 어떤 모양으로 나오는가"다.
 * 개념을 다 알아도 지문에서 뭘 먼저 봐야 할지 모르면 풀지 못하므로, 길의
 * 개념 칸 뒤에 붙는다.
 */
export type PatternNode = {
  /** `pattern:` 접두사 없이 쓴다. 노드 id는 path-nodes.ts가 만든다. */
  id: string;
  subject: Subject;
  /** 화면에 보이는 유형 이름. 수능에서 부르는 이름을 그대로 쓴다. */
  title: string;
  /** 길 목록에 보이는 한 줄. 이 유형이 무엇을 묻는지. */
  summary: string;
  /** 이 유형이 어떻게 생겼고 무엇을 요구하는지. */
  explanation: string;
  /** 문제를 열었을 때 순서대로 확인할 것. 3개. */
  keyPoints: [string, string, string];
  /** 이 유형에서 학습자가 실제로 하는 실수. */
  mistake: string;
  /** 확인 문제 3개. */
  questions: NodeQuestion[];
};

export const PATTERN_NODES: PatternNode[] = [];

const BY_SUBJECT = new Map<Subject, PatternNode[]>();
for (const node of PATTERN_NODES) {
  const list = BY_SUBJECT.get(node.subject) ?? [];
  list.push(node);
  BY_SUBJECT.set(node.subject, list);
}

export function getPatternNodes(subject: Subject): PatternNode[] {
  return BY_SUBJECT.get(subject) ?? [];
}

export function findPatternNode(id: string): PatternNode | undefined {
  return PATTERN_NODES.find((node) => node.id === id);
}
