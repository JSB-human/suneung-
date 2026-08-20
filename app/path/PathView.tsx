"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import type { Subject } from "../practice/types.ts";
import type { PathNode, PathNodeKind } from "./types.ts";
import NodeRunner from "./NodeRunner";
import { getNode, getNodesForSubject } from "./path-nodes.ts";
import {
  getNodeStatus,
  getSubjectProgress,
  type PathState,
} from "./path-state.ts";
import { getPhase } from "./phases.ts";
import RoadmapSheet from "./RoadmapSheet";
import { shouldScrollToCurrent } from "./scroll-into-view.ts";
import { buildRoadmap, formatWeekRange, type Roadmap } from "./roadmap.ts";

export type PathViewProps = {
  /**
   * 이 탭이 지금 보이는지.
   *
   * 탭은 숨겨질 뿐 마운트된 채로 남는다(hidden -> display:none). 그래서 마운트
   * 시점에 현재 칸으로 스크롤해도 아무 일이 일어나지 않는다 — 숨은 요소는
   * 위치가 없다. 실제로 보이게 된 순간을 알아야 스크롤할 수 있다.
   */
  isActive?: boolean;
  subject: Subject;
  state: PathState;
  /** 오늘 날짜(YYYY-MM-DD). 렌더 중 `new Date()`를 부르지 않으려고 프롭으로 받는다. */
  todayKey: string;
  onCompleteNode: (
    nodeId: string,
    correctCount: number,
    totalCount: number,
  ) => void;
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

/**
 * 길을 세 구간으로 나눈다: 기초 → 개념 → 유형.
 *
 * 칸 목록은 한 과목이 50칸까지 가고 화면으로 6000px가 넘는다. 한 줄로 이어
 * 놓으면 지금 어디쯤인지, 앞으로 뭐가 남았는지 가늠이 안 된다. 구간 제목이
 * 있으면 훑으면서 위치를 잡을 수 있다.
 *
 * kind가 이미 학습 순서대로 연속해 있어(기초 전부 → 개념 전부 → 유형 전부)
 * 따로 정렬하지 않고 이어진 덩어리로 자르기만 하면 된다.
 */
const SECTION_LABELS: Record<PathNodeKind, { title: string; hint: string }> = {
  capsule: {
    title: "기초 다지기",
    hint: "여기부터. 몰라도 되는 걸 먼저 덜어 냅니다.",
  },
  concept: { title: "개념 익히기", hint: "시험에 나오는 개념을 한 칸씩." },
  pattern: {
    title: "문제 유형 익히기",
    hint: "문제가 어떻게 나오는지, 뭘 먼저 볼지.",
  },
};

function groupByKind(
  nodes: PathNode[],
): { kind: PathNodeKind; nodes: PathNode[] }[] {
  const groups: { kind: PathNodeKind; nodes: PathNode[] }[] = [];
  for (const node of nodes) {
    const last = groups[groups.length - 1];
    if (last && last.kind === node.kind) {
      last.nodes.push(node);
      continue;
    }
    groups.push({ kind: node.kind, nodes: [node] });
  }
  return groups;
}

export default function PathView({
  subject,
  state,
  todayKey,
  onCompleteNode,
  onOutcome,
  isActive = true,
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

  // 탭이 보이게 됐을 때 지금 칸으로 데려간다. 진도가 나갈수록 목록이 길어져
  // (영어는 6000px가 넘는다) 매번 자기 자리를 찾아 내려가야 하기 때문이다.
  //
  // 다만 이미 첫 화면 안에 있으면 스크롤하지 않는다. 시작한 지 얼마 안 된
  // 사람은 현재 칸이 맨 위인데, 그걸 화면 가운데로 올리면 미쿠 카드와 이번 주
  // 카드가 위로 밀려 사라진다. 도와주려다 맥락을 뺏는 셈이다.
  useEffect(() => {
    if (!isActive) {
      return;
    }
    const element = currentRef.current;
    const shouldScroll = shouldScrollToCurrent({
      isActive,
      hasCurrentNode: Boolean(element),
      currentTop: element ? element.getBoundingClientRect().top : 0,
      viewportHeight: window.innerHeight,
    });
    if (!shouldScroll || !element) {
      return;
    }
    element.scrollIntoView({ block: "center", behavior: "auto" });
  }, [isActive, subject]);

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
          <span className="week-card-range">
            {formatWeekRange(roadmap.currentWeek)}
          </span>
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
          {isRoadmapOpen
            ? "로드맵 접기"
            : `수능까지 전체 로드맵 보기 (${roadmap.weeks.length}주)`}
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

      {groupByKind(nodes).map((group) => {
        const label = SECTION_LABELS[group.kind];
        const doneInGroup = group.nodes.filter(
          (node) => getNodeStatus(state, node.id) === "done",
        ).length;
        return (
          <section className="path-section" key={group.kind}>
            <div className="path-section-head">
              <h3 className="path-section-title">{label.title}</h3>
              <span className="path-section-count">
                {doneInGroup} / {group.nodes.length}
              </span>
            </div>
            <p className="path-section-hint">{label.hint}</p>
            <ol className="path-list">
              {group.nodes.map((node) => {
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
                        {needsReview ? (
                          <em className="path-node-review">복습 필요</em>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </section>
  );
}
