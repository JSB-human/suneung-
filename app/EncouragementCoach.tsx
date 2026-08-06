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
    return "미쿠가 옆에서 항상 응원하고 있어! 🎵 아직 시작 전이어도 괜찮아, 가장 쉬운 것부터 3분만 해볼까? ✨";
  }

  if (completedCount < totalCount) {
    return `우와, 벌써 ${completedCount}개나 완료했네! 🎵 다음 한 칸도 미쿠랑 같이 차근차근 해보자! 💖`;
  }

  return "오늘 목표를 완벽하게 다 채웠어! 🌟 정말 대단해! 미쿠가 최고로 칭찬해 줄게! 🎉🎵";
}

function formatSuneungCountdown(dday: number): string {
  if (dday === 0) {
    return "2028 수능 D-DAY 🎯";
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
      aria-label="하츠네 미쿠 학습 파트너"
    >
      <div className="encouragement-card" style={{ background: "linear-gradient(135deg, #e6f9f8 0%, #ffffff 100%)", borderColor: "#a0ece7" }}>
        <div className="encouragement-visual">
          <div className="miku-avatar-box" style={{ width: 84, height: 84, borderRadius: "50%", background: "#39c5bb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(57, 197, 187, 0.35)", position: "relative" }}>
            <span style={{ fontSize: 42, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>🎧</span>
            <span style={{ position: "absolute", bottom: -2, right: -2, background: "#ff7ebb", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 10 }}>Miku 🎵</span>
          </div>

          <div className="encouragement-bubble" style={{ borderColor: "#a0ece7" }}>
            <p className="encouragement-eyebrow" style={{ color: "#00a496" }}>🎵 수능人 파트너 · 하츠네 미쿠 (初音ミク)</p>
            <h2 style={{ color: "#0f172a" }}>{message}</h2>
            <div className="encouragement-meta" aria-label="학습 진행 정보">
              <span style={{ borderColor: "#a0ece7", color: "#00a496", background: "#e6f9f8" }}>{countdownLabel}</span>
              <span style={{ borderColor: "#ffb7d5", color: "#d946ef", background: "#fdf4ff" }}>Lv.{level}</span>
              <span style={{ borderColor: "#a0ece7", color: "#00a496", background: "#e6f9f8" }}>성장 포인트 {points} P</span>
            </div>
            <p>
              연속 학습 {streak}일째 달성 중! 🎵 매일 조금씩 쌓이면 미쿠랑 함께 목표 대학까지 갈 수 있어! ✨
            </p>
          </div>
        </div>

        <div className="encouragement-actions">
          <button
            type="button"
            className="primary-action"
            style={{ ...TOUCH_TARGET_STYLE, background: "#39c5bb", borderColor: "#00a496" }}
            onClick={onStartThreeMinutes}
          >
            🎵 미쿠와 3분 집중 시작
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
