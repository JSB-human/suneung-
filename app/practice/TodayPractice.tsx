"use client";

import { useMemo, useState } from "react";
import PracticeRunner from "./PracticeRunner";
import { listSkillIds } from "./generators/registry.ts";
import { getSkillEntry } from "./skill-map.ts";
import { isDue, skillKey, type ReviewProgress } from "./review-queue.ts";
import type { PracticeOutcomeReport } from "./PracticeRunner";

export type TodayPracticeProps = {
  reviewById: Record<string, ReviewProgress>;
  today: string;
  onOutcome: (report: PracticeOutcomeReport) => void;
};

export default function TodayPractice({ reviewById, today, onOutcome }: TodayPracticeProps) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);

  // 복습일이 지난 스킬을 먼저, 그다음 아직 한 번도 안 푼 스킬을 준다.
  const queue = useMemo(() => {
    const all = listSkillIds();
    const due = all.filter((skillId) => {
      const progress = reviewById[skillKey(skillId)];
      return progress ? isDue(progress, today) : false;
    });
    const fresh = all.filter((skillId) => !reviewById[skillKey(skillId)]);
    return { due, fresh };
  }, [reviewById, today]);

  const suggested = queue.due[0] ?? queue.fresh[0] ?? listSkillIds()[0];
  const suggestedLabel = getSkillEntry(suggested)?.label ?? suggested;

  return (
    <section className="today-practice" aria-label="오늘의 연습">
      <div className="today-practice-head">
        <div>
          <p className="practice-eyebrow">오늘의 연습</p>
          <h3>
            {queue.due.length > 0
              ? `복습할 게 ${queue.due.length}개 있어`
              : "새 문제로 시작해 볼까?"}
          </h3>
          <p className="today-practice-sub">{suggestedLabel}부터 시작하면 돼.</p>
        </div>
        <button
          type="button"
          className="practice-primary"
          onClick={() => setOpenSkillId((previous) => (previous === suggested ? null : suggested))}
          aria-expanded={openSkillId === suggested}
        >
          {openSkillId === suggested ? "접기" : "바로 시작"}
        </button>
      </div>

      {openSkillId ? (
        <PracticeRunner key={openSkillId} skillId={openSkillId} onOutcome={onOutcome} />
      ) : null}
    </section>
  );
}
