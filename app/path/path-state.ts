import type { Subject } from "../practice/types.ts";
import { getNode, getNodesForSubject } from "./path-nodes.ts";
import type { PathNode } from "./types.ts";

export type NodeStatus = "done" | "current" | "locked";

export type PathState = {
  completedNodeIds: string[];
  needsReviewNodeIds: string[];
};

export const EMPTY_PATH_STATE: PathState = {
  completedNodeIds: [],
  needsReviewNodeIds: [],
};

const REVIEW_THRESHOLD = 2;

function onlyKnownNodeIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is string => typeof item === "string" && getNode(item) !== null,
  );
}

export function normalizePathState(value: unknown): PathState {
  if (!value || typeof value !== "object") {
    return EMPTY_PATH_STATE;
  }
  const candidate = value as Partial<PathState>;
  return {
    completedNodeIds: onlyKnownNodeIds(candidate.completedNodeIds),
    needsReviewNodeIds: onlyKnownNodeIds(candidate.needsReviewNodeIds),
  };
}

export function getNextNode(state: PathState, subject: Subject): PathNode | null {
  return (
    getNodesForSubject(subject).find(
      (node) => !state.completedNodeIds.includes(node.id),
    ) ?? null
  );
}

export function getNodeStatus(state: PathState, nodeId: string): NodeStatus {
  if (state.completedNodeIds.includes(nodeId)) {
    return "done";
  }
  const node = getNode(nodeId);
  if (!node) {
    return "locked";
  }
  return getNextNode(state, node.subject)?.id === nodeId ? "current" : "locked";
}

export function completeNode(
  state: PathState,
  nodeId: string,
  correctCount: number,
  totalCount: number,
): PathState {
  if (!getNode(nodeId)) {
    return state;
  }

  const completedNodeIds = state.completedNodeIds.includes(nodeId)
    ? state.completedNodeIds
    : [...state.completedNodeIds, nodeId];

  const needsReview = totalCount > 0 && correctCount < REVIEW_THRESHOLD;
  const withoutThis = state.needsReviewNodeIds.filter((id) => id !== nodeId);

  return {
    completedNodeIds,
    needsReviewNodeIds: needsReview ? [...withoutThis, nodeId] : withoutThis,
  };
}

export function getSubjectProgress(
  state: PathState,
  subject: Subject,
): { done: number; total: number } {
  const nodes = getNodesForSubject(subject);
  return {
    done: nodes.filter((node) => state.completedNodeIds.includes(node.id)).length,
    total: nodes.length,
  };
}
