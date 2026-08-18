"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import type { Subject } from "../practice/types.ts";
import NodeRunner from "./NodeRunner";
import { getNode, getNodesForSubject } from "./path-nodes.ts";
import { getNodeStatus, getSubjectProgress, type PathState } from "./path-state.ts";
import { getPhase } from "./phases.ts";
import RoadmapSheet from "./RoadmapSheet";
import { buildRoadmap, formatWeekRange, type Roadmap } from "./roadmap.ts";

export type PathViewProps = {
  subject: Subject;
  state: PathState;
  /** 오늘 날짜(YYYY-MM-DD). 렌더 중 `new Date()`를 부르지 않으려고 프롭으로 받는다. */
  todayKey: string;
  onCompleteNode: (nodeId: string, correctCount: number, totalCount: number) => void;
  onOutcome?: (report: PracticeOutcomeReport) => void;
};

function paceLine(roadmap: Roadmap): string {
  if (roadmap.remainingCount === 0) {
    return "길을 다 돌았어. 이제 복습으로 굳히면 돼!";
  }
  if (roadmap.isAfterExam) {
    return "수능일이 지났어. 남은 칸은 천천히 채워도 돼.";
  }
  if (roadmap.isOverCapacity) {
    return `이 속도로는 수능 전에 다 못 돌아. 하루 3칸이 최대라 ${roadmap.remainingCount}칸이 남았어.`;
  }
  if (roadmap.pace === "ahead") {
    const weeks = roadmap.weeksAhead;
    return weeks >= 1
      ? `${weeks}주 앞서 있어. 잘 가고 있어!`
      : `${roadmap.nodesAhead}칸 앞서 있어. 잘 가고 있어!`;
  }
  if (roadmap.pace === "behind") {
    return `${-roadmap.nodesAhead}칸 밀렸어. 그래도 남은 주에 다시 나눴으니까 이번 주 ${roadmap.nodesPerWeek}칸만 하면 따라잡혀.`;
  }
  if (roadmap.isWeekGoalMet) {
    return "제 속도로 잘 왔어. 더 가고 싶으면 다음 칸도 열려 있어.";
  }
  return "딱 맞게 가고 있어. 이 속도만 지키자.";
}

function headline(roadmap: Roadmap): string {
  if (roadmap.remainingCount === 0) {
    return "이번 주는 복습만";
  }
  if (roadmap.nodesPerWeek === 0) {
    return "이번 주는 복습 주간";
  }
  if (roadmap.isWeekGoalMet) {
    return "이번 주 몫은 끝냈어";
  }
  return `이번 주 ${roadmap.nodesPerWeek}칸`;
}

export default function PathView({
  subject,
  state,
  todayKey,
  onCompleteNode,
  onOutcome,
}: PathViewProps) {
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const currentRef = useRef<HTMLLIElement | null>(null);
  const roadmapId = useId();

  const nodes = getNodesForSubject(subject);
  const progress = getSubjectProgress(state, subject);
  const roadmap = useMemo(
    () => buildRoadmap({ subject, state, todayKey }),
    [subject, state, todayKey],
  );

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [subject]);

  if (openNodeId) {
    // 길 순서상 바로 다음 칸. 방금 끝낸 칸을 완료로 표시하면 여기가 열린다.
    const openIndex = nodes.findIndex((node) => node.id === openNodeId);
    const nextNode = openIndex >= 0 ? nodes[openIndex + 1] : undefined;

    return (
      <NodeRunner
        // 칸이 바뀌면 새로 마운트해야 한다. 안 그러면 이전 칸의 진행 상태가 남는다.
        key={openNodeId}
        nodeId={openNodeId}
        onOutcome={onOutcome}
        onComplete={(correctCount, totalCount) =>
          onCompleteNode(openNodeId, correctCount, totalCount)
        }
        onNextNode={nextNode ? () => setOpenNodeId(nextNode.id) : undefined}
        nextNodeTitle={nextNode?.title}
        onClose={() => setOpenNodeId(null)}
      />
    );
  }

  const phase = getPhase(roadmap.currentWeek.phase);
  const progressPercent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <section className="path-view" aria-label={`${subject} 학습 경로`}>
      <article
        className={`week-card ${roadmap.isWeekGoalMet ? "is-met" : ""} ${
          roadmap.isOverCapacity ? "is-warning" : ""
        }`}
        aria-label="이번 주 계획"
      >
        <header className="week-card-head">
          <span className="week-card-phase">{phase.name}</span>
          <span className="week-card-range">{formatWeekRange(roadmap.currentWeek)}</span>
        </header>

        <h2 className="week-card-title">{headline(roadmap)}</h2>
        <p className="week-card-pace">{paceLine(roadmap)}</p>

        {roadmap.currentWeek.nodeIds.length > 0 ? (
          <ul className="week-card-nodes">
            {roadmap.currentWeek.nodeIds.map((nodeId) => {
              const node = getNode(nodeId);
              if (!node) {
                return null;
              }
              return (
                <li key={nodeId}>
                  <button
                    type="button"
                    className="week-card-node"
                    disabled={getNodeStatus(state, nodeId) === "locked"}
                    onClick={() => setOpenNodeId(nodeId)}
                  >
                    <span className="week-card-node-order" aria-hidden="true">
                      {node.order}
                    </span>
                    <span className="week-card-node-body">
                      <strong>{node.title}</strong>
                      <small>{node.summary}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="week-card-empty">
            새로 열 칸이 없는 주야. 복습 큐랑 오답노트를 돌리자.
          </p>
        )}

        <div className="week-card-progress">
          <div className="week-card-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p>
            <strong>
              {progress.done} / {progress.total}칸
            </strong>
            <span>
              {roadmap.isAfterExam
                ? "수능일이 지났어"
                : `수능까지 D-${Math.max(0, roadmap.daysUntilExam)}`}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="week-card-toggle"
          aria-expanded={isRoadmapOpen}
          aria-controls={roadmapId}
          onClick={() => setIsRoadmapOpen((previous) => !previous)}
        >
          {isRoadmapOpen ? "로드맵 접기" : `수능까지 전체 로드맵 보기 (${roadmap.weeks.length}주)`}
        </button>

        {isRoadmapOpen ? (
          <div id={roadmapId}>
            <RoadmapSheet roadmap={roadmap} />
          </div>
        ) : null}
      </article>

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
