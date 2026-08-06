"use client";

import { resolveConceptSource } from "./concept-source.ts";

export type ConceptSheetProps = {
  skillId: string;
  open: boolean;
  onClose: () => void;
};

export default function ConceptSheet({ skillId, open, onClose }: ConceptSheetProps) {
  const source = resolveConceptSource(skillId);
  if (!open || !source) {
    return null;
  }

  return (
    <div
      className="concept-sheet"
      role="dialog"
      aria-modal="false"
      aria-label={`${source.title} 개념 요약`}
    >
      <div className="concept-sheet-head">
        <div>
          <p className="concept-sheet-eyebrow">지금 푸는 개념</p>
          <h3>{source.title}</h3>
        </div>
        <button type="button" onClick={onClose} className="concept-sheet-close">
          닫기
        </button>
      </div>

      <p className="concept-sheet-oneline">{source.oneLine}</p>

      {source.formula ? <p className="concept-sheet-formula">{source.formula}</p> : null}

      <ul className="concept-sheet-points">
        {source.keyPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      {source.microPractice ? (
        <div className="concept-sheet-example">
          <strong>직접 해보기 · {source.microPractice}</strong>
        </div>
      ) : null}

      {source.workedExample ? (
        <div className="concept-sheet-example">
          <strong>{source.workedExample.prompt}</strong>
          <p>{source.workedExample.process}</p>
          <span>{source.workedExample.result}</span>
        </div>
      ) : null}

      <p className="concept-sheet-mistake">자주 하는 실수 · {source.mistake}</p>
    </div>
  );
}
