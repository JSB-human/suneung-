"use client";

import { getNode } from "./path-nodes.ts";
import { getPhase } from "./phases.ts";
import { formatWeekRange, groupWeeksByPhase, type Roadmap, type WeekPlan } from "./roadmap.ts";

export type RoadmapSheetProps = {
  roadmap: Roadmap;
};

function weekLabel(week: WeekPlan): string {
  return week.weekIndex === 0 ? "이번 주" : `${week.weekIndex + 1}주차`;
}

type SheetRow =
  | { kind: "week"; week: WeekPlan }
  | { kind: "review"; from: WeekPlan; to: WeekPlan; weekCount: number };

/**
 * 새 칸이 없는 주가 줄줄이 이어지면 한 줄로 접는다.
 * 접지 않으면 "복습 주간" 카드 46장이 로드맵을 8000px 넘게 늘린다.
 */
function toRows(weeks: WeekPlan[]): SheetRow[] {
  const rows: SheetRow[] = [];
  for (const week of weeks) {
    if (week.nodeIds.length > 0 || week.weekIndex === 0) {
      rows.push({ kind: "week", week });
      continue;
    }
    const last = rows[rows.length - 1];
    if (last && last.kind === "review") {
      last.to = week;
      last.weekCount += 1;
      continue;
    }
    rows.push({ kind: "review", from: week, to: week, weekCount: 1 });
  }
  return rows;
}

export default function RoadmapSheet({ roadmap }: RoadmapSheetProps) {
  const groups = groupWeeksByPhase(roadmap.weeks);

  return (
    <div className="roadmap-sheet">
      <p className="roadmap-sheet-lead">
        수능까지 {roadmap.weeks.length}주. 남은 {roadmap.remainingCount}칸을 주 단위로 나눈
        계획입니다. 밀리면 다음에 열 때 남은 주에 맞춰 다시 나눕니다.
      </p>

      {groups.map((group) => {
        const phase = getPhase(group.phase);
        return (
          <section className="roadmap-phase" key={group.phase}>
            <header className="roadmap-phase-head">
              <div className="roadmap-phase-title">
                <strong>{phase.name}</strong>
                <span>{phase.period}</span>
              </div>
              <span className="roadmap-phase-count">
                {group.nodeCount > 0 ? `${group.nodeCount}칸` : "복습"}
              </span>
            </header>
            <p className="roadmap-phase-focus">{phase.focus}</p>

            <ol className="roadmap-week-list">
              {toRows(group.weeks).map((row) => {
                if (row.kind === "review") {
                  return (
                    <li className="roadmap-week is-review" key={row.from.startDate}>
                      <div className="roadmap-week-head">
                        <strong>
                          {weekLabel(row.from)}
                          {row.weekCount > 1 ? ` ~ ${weekLabel(row.to)}` : ""}
                        </strong>
                        <span>{row.weekCount}주</span>
                      </div>
                      <p className="roadmap-week-empty">
                        복습 주간 · 새 칸 없이 복습 큐와 오답노트를 돕니다
                      </p>
                    </li>
                  );
                }

                const week = row.week;
                return (
                  <li
                    key={week.startDate}
                    className={`roadmap-week ${week.weekIndex === 0 ? "is-current" : ""} ${
                      week.nodeIds.length === 0 ? "is-review" : ""
                    }`}
                  >
                    <div className="roadmap-week-head">
                      <strong>{weekLabel(week)}</strong>
                      <span>{formatWeekRange(week)}</span>
                    </div>

                    {week.nodeIds.length > 0 ? (
                      <ul className="roadmap-week-nodes">
                        {week.nodeIds.map((nodeId) => {
                          const node = getNode(nodeId);
                          return (
                            <li key={nodeId}>
                              <span className="roadmap-week-node-order" aria-hidden="true">
                                {node ? node.order : "·"}
                              </span>
                              <span>{node ? node.title : nodeId}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="roadmap-week-empty">복습 주간 · 새 칸 없음</p>
                    )}

                    {roadmap.subject === "english" ? (
                      <p className="roadmap-week-vocab">단어 {week.vocabCount}개</p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
