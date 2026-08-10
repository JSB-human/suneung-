"use client";

import MikuPartner from "./miku/MikuPartner";
import type { MikuLine } from "./miku/miku-lines.ts";
import type { MikuMood } from "./miku/miku-mood.ts";

type EncouragementCoachProps = {
  /** 미쿠가 지금 할 말. 고르는 일은 miku-lines.ts가 한다. */
  line: MikuLine;
  mood: MikuMood;
  streak: number;
  dday: number;
  points: number;
  level: number;
  onStartThreeMinutes: () => void;
  onOpenEasyStep: () => void;
  className?: string;
};

const TOUCH_TARGET_STYLE = { minHeight: 44, minWidth: 44 };

const EYEBROW = "🎵 수능人 파트너 · 하츠네 미쿠 (初音ミク)";

function formatSuneungCountdown(dday: number): string {
  if (dday === 0) {
    return "2028 수능 D-DAY";
  }

  if (dday < 0) {
    return `2028 수능 D+${Math.abs(dday)}`;
  }

  return `2028 수능 D-${dday}`;
}

/** 연속 학습일 줄. 0일째에 "연속 0일"이라고 쓰면 시작하기 더 싫어진다. */
function formatStreakLine(streak: number): string {
  if (streak <= 0) {
    return "오늘 한 칸만 하면 연속 기록이 다시 시작돼.";
  }
  if (streak === 1) {
    return "오늘로 하루째. 내일 또 오면 이어져.";
  }
  return `연속 ${streak}일째. 이 줄을 끊지 않는 게 제일 큰 무기야.`;
}

export function EncouragementCoach({
  line,
  mood,
  streak,
  dday,
  points,
  level,
  onStartThreeMinutes,
  onOpenEasyStep,
  className,
}: EncouragementCoachProps) {
  return (
    <section
      className={className ? `encouragement-coach ${className}` : "encouragement-coach"}
      aria-label="하츠네 미쿠 학습 파트너"
    >
      <div className="encouragement-card">
        <MikuPartner mood={mood} line={line} eyebrow={EYEBROW}>
          <div className="encouragement-meta" aria-label="학습 진행 정보">
            <span>{formatSuneungCountdown(dday)}</span>
            <span>Lv.{level}</span>
            <span>성장 포인트 {points} P</span>
          </div>
          <p className="miku-streak-line">{formatStreakLine(streak)}</p>
        </MikuPartner>

        <div className="encouragement-actions">
          <button
            type="button"
            className="primary-action"
            style={TOUCH_TARGET_STYLE}
            onClick={onStartThreeMinutes}
          >
            미쿠와 3분 집중 시작
          </button>
          <button
            type="button"
            className="secondary-action"
            style={TOUCH_TARGET_STYLE}
            onClick={onOpenEasyStep}
          >
            가장 쉬운 한 칸 열기
          </button>
        </div>
      </div>
    </section>
  );
}

export default EncouragementCoach;
