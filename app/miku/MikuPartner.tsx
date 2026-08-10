"use client";

import type { ReactNode } from "react";
import type { MikuLine } from "./miku-lines.ts";
import type { MikuMood } from "./miku-mood.ts";

export type MikuPartnerProps = {
  mood: MikuMood;
  /** 이미 골라 둔 대사. 고르는 일은 순수 모듈이 하고 여기서는 보여 주기만 한다. */
  line: MikuLine;
  /** `full`은 오늘 탭의 큰 카드, `compact`는 문제 화면 옆의 한 줄 반응. */
  variant?: "full" | "compact";
  /** 말풍선 위 작은 줄. 넘기지 않으면 그리지 않는다. */
  eyebrow?: string;
  /** 배지·버튼처럼 말풍선 아래 붙일 것들. */
  children?: ReactNode;
};

const MOOD_LABEL: Record<MikuMood, string> = {
  cheerful: "신났어",
  encouraging: "같이 가는 중",
  proud: "뿌듯해",
  worried: "좀 걱정돼",
  sleepy: "졸려",
};

export default function MikuPartner({
  mood,
  line,
  variant = "full",
  eyebrow,
  children,
}: MikuPartnerProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`miku-partner miku-mood-${mood}${isCompact ? " is-compact" : ""}`}
      aria-label="하츠네 미쿠 학습 파트너"
    >
      <div className="miku-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 아바타 1장이라 next/image 최적화 이득이 없다. */}
        <img src="/miku_avatar.jpg" alt="하츠네 미쿠 학습 파트너" />
        <span className="miku-mood-badge">{MOOD_LABEL[mood]}</span>
      </div>

      <div className="miku-bubble">
        {eyebrow ? <p className="miku-eyebrow">{eyebrow}</p> : null}
        <p className="miku-line" role="status" aria-live="polite">
          {line.text}
        </p>
        {children}
      </div>
    </div>
  );
}
