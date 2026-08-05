"use client";

type EncouragementCoachProps = {
  completedCount: number;
  totalCount: number;
  streak: number;
  dday: number;
  points: number;
  level: number;
  onStartThreeMinutes: () => void;
  onOpenEasyStep: () => void;
  className?: string;
};

const TOUCH_TARGET_STYLE = { minHeight: 44, minWidth: 44 };

function getEncouragementLine(completedCount: number, totalCount: number): string {
  if (totalCount <= 0 || completedCount <= 0) {
    return "능이가 보고 있겠습니다. 아직 시작 전이어도 괜찮아요. 가장 쉬운 한 칸부터 열어 보면 됩니다.";
  }

  if (completedCount < totalCount) {
    return `${completedCount}칸이나 해냈습니다. 남은 건 전부가 아니라 다음 한 칸이에요.`;
  }

  return "오늘 할 칸을 다 채웠네요. 무리하지 않아도 이런 마무리가 차곡차곡 쌓입니다.";
}

function formatSuneungCountdown(dday: number): string {
  if (dday === 0) {
    return "2028 수능 D-DAY";
  }

  if (dday < 0) {
    return `2028 수능 D+${Math.abs(dday)}`;
  }

  return `2028 수능 D-${dday}`;
}

export function EncouragementCoach({
  completedCount,
  totalCount,
  streak,
  dday,
  points,
  level,
  onStartThreeMinutes,
  onOpenEasyStep,
  className,
}: EncouragementCoachProps) {
  const message = getEncouragementLine(completedCount, totalCount);
  const countdownLabel = formatSuneungCountdown(dday);

  return (
    <section
      className={className ? `encouragement-coach ${className}` : "encouragement-coach"}
      aria-label="수능人 응원 카드"
    >
      <div className="encouragement-card">
        <div className="encouragement-visual">
          <div className="coach-mascot" aria-hidden="true">
            <div className="coach-face">
              <span className="coach-hair coach-hair-left" />
              <span className="coach-hair coach-hair-right" />
              <span className="coach-eye coach-eye-left" />
              <span className="coach-eye coach-eye-right" />
              <span className="coach-cheek coach-cheek-left" />
              <span className="coach-cheek coach-cheek-right" />
              <span className="coach-mouth" />
            </div>
            <span className="coach-body" />
          </div>

          <div className="encouragement-bubble">
            <p className="encouragement-eyebrow">수능人 파트너 능이</p>
            <h2>{message}</h2>
            <div className="encouragement-meta" aria-label="학습 진행 정보">
              <span>{countdownLabel}</span>
              <span>Lv.{level}</span>
              <span>성장 포인트 {points}</span>
            </div>
            <p>
              연속 학습 {streak}일째입니다. 포인트는 틀렸다고 줄지 않고, 시도와 완료가 쌓일 때만 올라갑니다.
            </p>
            <p>
              틀려도 시도 자체가 의미 있습니다. 지금 멈추지 않는 쪽이 더 중요합니다.
            </p>
          </div>
        </div>

        <div className="encouragement-actions">
          <button
            type="button"
            className="primary-action"
            style={TOUCH_TARGET_STYLE}
            onClick={onStartThreeMinutes}
          >
            3분만 해보기
          </button>
          <button
            type="button"
            className="secondary-action"
            style={TOUCH_TARGET_STYLE}
            onClick={onOpenEasyStep}
          >
            가장 쉬운 한 칸
          </button>
        </div>
      </div>
    </section>
  );
}

export default EncouragementCoach;
