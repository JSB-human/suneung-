"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";

import {
  FOUNDATION_SUBJECT_META,
  getFoundationCapsules,
  type FoundationCapsule,
  type FoundationSubject,
} from "./foundation-reference";

export type FoundationReferenceProps = {
  subject: FoundationSubject;
  className?: string;
  ariaLabel?: string;
};

const subjectTheme: Record<
  FoundationSubject,
  { accent: string; tint: string; border: string; strong: string }
> = {
  korean: {
    accent: "var(--korean)",
    tint: "var(--korean-soft)",
    border: "var(--korean-border)",
    strong: "var(--korean-strong)",
  },
  english: {
    accent: "var(--english)",
    tint: "var(--english-soft)",
    border: "var(--english-border)",
    strong: "var(--english-strong)",
  },
  math: {
    accent: "var(--math)",
    tint: "var(--math-soft)",
    border: "var(--math-border)",
    strong: "var(--math-strong)",
  },
};

const panelStyle: CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 20,
  background: "var(--surface)",
  boxShadow: "var(--shadow-md)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--ink-strong)",
  fontSize: 16,
  lineHeight: 1.45,
};

const normalizeSearch = (value: string): string => value.trim().toLocaleLowerCase("ko-KR");

const includesSearch = (capsule: FoundationCapsule, query: string): boolean => {
  if (!query) {
    return true;
  }

  const searchableText = [
    capsule.title,
    capsule.eyebrow,
    capsule.beginnerExplanation,
    ...capsule.keyPoints,
    capsule.frame ?? "",
    capsule.workedExample.prompt,
    capsule.workedExample.process,
    capsule.workedExample.result,
    capsule.commonTrap,
    capsule.quickCheck.prompt,
    capsule.quickCheck.answer,
    ...capsule.tags,
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchableText.includes(query);
};

export function FoundationReference({
  subject,
  className,
  ariaLabel,
}: FoundationReferenceProps) {
  const baseId = useId();
  const meta = FOUNDATION_SUBJECT_META[subject];
  const theme = subjectTheme[subject];
  const allCapsules = useMemo(() => getFoundationCapsules(subject), [subject]);
  const [query, setQuery] = useState("");
  const [openBySubject, setOpenBySubject] = useState<Record<FoundationSubject, string | null>>(() => ({
    korean: getFoundationCapsules("korean")[0]?.id ?? null,
    english: getFoundationCapsules("english")[0]?.id ?? null,
    math: getFoundationCapsules("math")[0]?.id ?? null,
  }));

  const normalizedQuery = normalizeSearch(query);
  const filteredCapsules = useMemo(
    () => allCapsules.filter((capsule) => includesSearch(capsule, normalizedQuery)),
    [allCapsules, normalizedQuery],
  );
  const storedOpenId = openBySubject[subject];
  const resolvedOpenId =
    storedOpenId === null
      ? null
      : filteredCapsules.some((capsule) => capsule.id === storedOpenId)
        ? storedOpenId
        : (filteredCapsules[0]?.id ?? null);

  const toggleCapsule = (capsuleId: string) => {
    setOpenBySubject((current) => ({
      ...current,
      [subject]: resolvedOpenId === capsuleId ? null : capsuleId,
    }));
  };

  return (
    <section
      className={className}
      aria-label={ariaLabel ?? `${meta.label} 기초 개념 학습`}
      style={{
        width: "100%",
        display: "grid",
        gap: 14,
        color: "#1F2A37",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          ...panelStyle,
          padding: 18,
          display: "grid",
          gap: 12,
          background: `linear-gradient(145deg, #FFFDFC 0%, ${theme.tint} 100%)`,
          borderColor: theme.border,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              padding: "5px 10px",
              borderRadius: 999,
              background: theme.accent,
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {meta.label} 기초 도서관
          </span>
          <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
            개념 {allCapsules.length}개 · 짧은 확인 {allCapsules.length}문제
          </span>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0, color: "var(--ink-strong)", fontSize: 22, lineHeight: 1.35 }}>
            {meta.shortDescription}
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>
            {meta.startGuide} 한 개를 읽고 확인 문제 하나만 풀어도 오늘 공부는 시작된 거예요.
          </p>
        </div>
        <label style={{ display: "grid", gap: 7 }}>
          <span style={{ color: "var(--ink)", fontSize: 13, fontWeight: 800 }}>개념 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${meta.label} 개념이나 용어를 검색해 보세요`}
            style={{
              width: "100%",
              minHeight: 46,
              padding: "11px 13px",
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              background: "var(--surface)",
              color: "var(--ink-strong)",
              fontSize: 15,
              outlineColor: theme.accent,
              boxSizing: "border-box",
            }}
          />
        </label>
      </header>

      <div role="status" aria-live="polite" style={{ color: "#667085", fontSize: 13, padding: "0 3px" }}>
        {normalizedQuery
          ? `‘${query.trim()}’ 검색 결과 ${filteredCapsules.length}개`
          : "위에서부터 하나씩 열어 보세요. 첫 개념은 미리 열어 두었어요."}
      </div>

      {filteredCapsules.length === 0 ? (
        <div style={{ ...panelStyle, padding: 20, textAlign: "center", lineHeight: 1.7 }}>
          <strong style={{ display: "block", color: "#111827", marginBottom: 4 }}>
            아직 일치하는 개념이 없어요.
          </strong>
          <span style={{ color: "#667085", fontSize: 14 }}>
            ‘함수’, ‘주어’, ‘문학’처럼 짧은 낱말로 다시 찾아볼까요?
          </span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filteredCapsules.map((capsule, index) => {
            const isOpen = resolvedOpenId === capsule.id;
            const panelId = `${baseId}-${capsule.id}-panel`;

            return (
              <article key={capsule.id} style={{ ...panelStyle, overflow: "hidden" }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleCapsule(capsule.id)}
                  style={{
                    width: "100%",
                    border: 0,
                    padding: "15px 16px",
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0, 1fr) 24px",
                    gap: 10,
                    alignItems: "center",
                    textAlign: "left",
                    background: isOpen ? theme.tint : "#FFFFFF",
                    color: "#111827",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      background: isOpen ? theme.accent : "#F2F0EC",
                      color: isOpen ? "#FFFFFF" : "#667085",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={{ minWidth: 0, display: "grid", gap: 3 }}>
                    <span style={{ color: theme.strong, fontSize: 12, fontWeight: 800 }}>
                      {capsule.eyebrow}
                    </span>
                    <strong style={{ fontSize: 16, lineHeight: 1.4 }}>{capsule.title}</strong>
                  </span>
                  <span aria-hidden="true" style={{ color: theme.strong, fontSize: 20, textAlign: "center" }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen ? (
                  <div
                    id={panelId}
                    style={{
                      padding: "17px 16px 18px",
                      display: "grid",
                      gap: 18,
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <p style={{ margin: 0, color: "var(--ink)", fontSize: 15, lineHeight: 1.75 }}>
                      {capsule.beginnerExplanation}
                    </p>

                    {capsule.scopeNote ? (
                      <aside
                        style={{
                          padding: "11px 12px",
                          borderRadius: 12,
                          background: "var(--accent-soft)",
                          border: "1px solid var(--line)",
                          color: "var(--primary)",
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: 1.6,
                        }}
                      >
                        범위 안내 · {capsule.scopeNote}
                      </aside>
                    ) : null}

                    <section style={{ display: "grid", gap: 8 }}>
                      <h3 style={sectionTitleStyle}>먼저 잡을 3가지</h3>
                      <ol style={{ margin: 0, paddingLeft: 21, color: "var(--ink)", lineHeight: 1.75 }}>
                        {capsule.keyPoints.map((point) => (
                          <li key={point} style={{ paddingLeft: 3 }}>{point}</li>
                        ))}
                      </ol>
                    </section>

                    {capsule.frame ? (
                      <section style={{ display: "grid", gap: 8 }}>
                        <h3 style={sectionTitleStyle}>한 줄 틀·공식</h3>
                        <div
                          style={{
                            padding: "12px 13px",
                            borderRadius: 12,
                            background: "#F2F0EC",
                            color: "#1F2A37",
                            fontSize: 14,
                            fontWeight: 800,
                            lineHeight: 1.6,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {capsule.frame}
                        </div>
                      </section>
                    ) : null}

                    <section style={{ display: "grid", gap: 9 }}>
                      <h3 style={sectionTitleStyle}>같이 푸는 미니 예제</h3>
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          border: `1px solid ${theme.border}`,
                          background: "#FFFDFC",
                          display: "grid",
                          gap: 8,
                          lineHeight: 1.65,
                        }}
                      >
                        <strong style={{ color: "#111827" }}>{capsule.workedExample.prompt}</strong>
                        <span style={{ color: "#4B5563", fontSize: 14 }}>{capsule.workedExample.process}</span>
                        <span style={{ color: theme.strong, fontSize: 14, fontWeight: 800 }}>
                          답 · {capsule.workedExample.result}
                        </span>
                      </div>
                    </section>

                    <div style={{ marginTop: 4 }}>
                      <a
                        className="ebs-link"
                        href={`https://www.youtube.com/results?search_query=EBS+${meta.label}+${encodeURIComponent(capsule.title)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: "var(--accent-soft)",
                          color: "var(--primary)",
                          fontWeight: 800,
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        🎥 YouTube / EBS 관련 개념 강의 시청 ↗
                      </a>
                    </div>

                    <section
                      style={{
                        padding: "12px 13px",
                        borderRadius: 12,
                        background: "#FFF7ED",
                        border: "1px solid #FED7AA",
                        color: "#7C2D12",
                        fontSize: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      <strong>자주 빠지는 함정 · </strong>{capsule.commonTrap}
                    </section>

                    <details
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: 14,
                        background: theme.tint,
                        padding: "13px 14px",
                      }}
                    >
                      <summary
                        style={{
                          cursor: "pointer",
                          color: theme.strong,
                          fontWeight: 900,
                          lineHeight: 1.55,
                        }}
                      >
                        30초 확인 · {capsule.quickCheck.prompt}
                      </summary>
                      <div style={{ display: "grid", gap: 7, marginTop: 11, lineHeight: 1.65 }}>
                        <strong style={{ color: "#111827" }}>정답 · {capsule.quickCheck.answer}</strong>
                        <span style={{ color: "#4B5563", fontSize: 14 }}>{capsule.quickCheck.explanation}</span>
                        <span style={{ color: theme.strong, fontSize: 13, fontWeight: 800 }}>
                          틀렸어도 괜찮아요. 지금 한 번 더 본 것이 바로 복습이에요.
                        </span>
                      </div>
                    </details>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default FoundationReference;
