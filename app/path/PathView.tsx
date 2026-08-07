"use client";

import { useEffect, useRef, useState } from "react";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import type { Subject } from "../practice/types.ts";
import NodeRunner from "./NodeRunner";
import { getNodesForSubject } from "./path-nodes.ts";
import { getNodeStatus, getSubjectProgress, type PathState } from "./path-state.ts";

export type PathViewProps = {
  subject: Subject;
  state: PathState;
  onCompleteNode: (nodeId: string, correctCount: number, totalCount: number) => void;
  onOutcome?: (report: PracticeOutcomeReport) => void;
};

export default function PathView({
  subject,
  state,
  onCompleteNode,
  onOutcome,
}: PathViewProps) {
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const currentRef = useRef<HTMLLIElement | null>(null);

  const nodes = getNodesForSubject(subject);
  const progress = getSubjectProgress(state, subject);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [subject]);

  if (openNodeId) {
    return (
      <NodeRunner
        nodeId={openNodeId}
        onOutcome={onOutcome}
        onComplete={(correctCount, totalCount) =>
          onCompleteNode(openNodeId, correctCount, totalCount)
        }
        onClose={() => setOpenNodeId(null)}
      />
    );
  }

  return (
    <section className="path-view" aria-label={`${subject} 학습 경로`}>
      <p className="path-progress" role="status">
        {progress.done} / {progress.total} 칸 완료
      </p>

      <ol className="path-list">
        {nodes.map((node) => {
          const status = getNodeStatus(state, node.id);
          const needsReview = state.needsReviewNodeIds.includes(node.id);
          return (
            <li
              key={node.id}
              ref={status === "current" ? currentRef : null}
              className={`path-node is-${status}`}
            >
              <button
                type="button"
                className="path-node-button"
                disabled={status === "locked"}
                onClick={() => setOpenNodeId(node.id)}
                aria-current={status === "current" ? "step" : undefined}
              >
                <span className="path-node-order" aria-hidden="true">
                  {status === "done" ? "✓" : node.order}
                </span>
                <span className="path-node-body">
                  <strong>{node.title}</strong>
                  <small>{node.summary}</small>
                  {needsReview ? <em className="path-node-review">복습 필요</em> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
