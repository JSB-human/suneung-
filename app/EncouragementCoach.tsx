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
          {/* 레벨·포인트는 기록 탭으로 옮겼다. 첫 화면에 0으로 찬 지표를 늘어놓으면
              "너는 아직 아무것도 안 했다"는 말을 여러 번 하는 셈이다. */}
          <div className="encouragement-meta" aria-label="학습 진행 정보">
            <span>{formatSuneungCountdown(dday)}</span>
          </div>
          <p className="miku-streak-line">{formatStreakLine(streak)}</p>
        </MikuPartner>

        {/* 첫 화면의 주된 행동은 하나여야 한다. 타이머는 헤더에서 열 수 있다. */}
        <div className="encouragement-actions">
          <button
            type="button"
            className="primary-action"
            style={TOUCH_TARGET_STYLE}
            onClick={onOpenEasyStep}
          >
            오늘 여기서 시작하기
          </button>
        </div>
      </div>
    </section>
  );
}

export default EncouragementCoach;
