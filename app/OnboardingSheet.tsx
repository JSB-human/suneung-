"use client";

export type OnboardingSheetProps = {
  userName: string;
  onDone: () => void;
};

/**
 * 처음 열었을 때 한 번만 뜨는 안내.
 *
 * 세 장으로 끝낸다. 처음 온 사람에게 필요한 건 기능 설명이 아니라
 * "여기서 뭘 하면 되는지" 한 가지다.
 */
const STEPS: Array<{ title: string; body: string }> = [
  {
    title: "하루에 한 칸이면 됩니다",
    body: "국어·영어·수학이 각각 한 줄로 이어져 있어요. 순서대로 한 칸씩만 열면 됩니다. 뭘 할지 고르지 않아도 돼요.",
  },
  {
    title: "한 칸은 3~5분이에요",
    body: "짧은 설명을 읽고, 공식을 보고, 확인 문제 세 개를 풉니다. 틀리면 해설을 보고 그 자리에서 다시 풀어요.",
  },
  {
    title: "앞으로 배울 것도 다 보여요",
    body: "아직 열리지 않은 칸도 제목이 보입니다. 수능까지 뭘 알아야 하는지 한눈에 확인할 수 있어요.",
  },
];

export default function OnboardingSheet({ userName, onDone }: OnboardingSheetProps) {
  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label="처음 안내">
      <div className="onboarding-sheet">
        <p className="practice-eyebrow">{userName}님, 반가워요</p>
        <h2>수능人 사용법</h2>

        <ol className="onboarding-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <button type="button" className="practice-primary" onClick={onDone}>
          시작하기
        </button>
      </div>
    </div>
  );
}
