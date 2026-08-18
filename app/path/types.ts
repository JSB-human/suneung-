import type { Subject } from "../practice/types.ts";

export type PathNodeKind = "capsule" | "concept" | "pattern";

export type PathNode = {
  id: string;
  subject: Subject;
  order: number;
  title: string;
  summary: string;
  kind: PathNodeKind;
  sourceId: string;
  formulaNoteId?: string;
  skillId?: string;
};

export type NodeQuestion = {
  id: string;
  prompt: string;
  choices: { value: string; label: string }[];
  answer: string;
  explanation: string;
};
