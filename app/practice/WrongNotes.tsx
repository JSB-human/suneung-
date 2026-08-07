"use client";

import { useState } from "react";
import PracticeRunner from "./PracticeRunner";
import { getSkillEntry } from "./skill-map.ts";
import type { PracticeOutcomeReport } from "./PracticeRunner";
import type { WrongNote } from "./practice-state.ts";

export type WrongNotesProps = {
  notes: WrongNote[];
  onOutcome: (report: PracticeOutcomeReport) => void;
};

type RetryTarget = {
  skillId: string;
  seed?: number;
  key: string;
};

export default function WrongNotes({ notes, onOutcome }: WrongNotesProps) {
  const [retry, setRetry] = useState<RetryTarget | null>(null);

  if (notes.length === 0) {
    return (
      <p className="practice-empty" role="status">
        아직 오답이 없어요. 문제를 풀다 틀리면 여기에 모아 두고 다시 풀 수 있어요.
      </p>
    );
  }

  return (
    <div className="wrong-notes">
      <p className="wrong-notes-count">모아 둔 오답 {notes.length}개</p>

      <ul className="wrong-notes-list">
        {notes.map((note) => {
          const entry = getSkillEntry(note.skillId);
          const key = `${note.skillId}:${note.seed}`;
          return (
            <li key={key} className="wrong-note">
              <div>
                <strong>{entry?.label ?? note.skillId}</strong>
                <span className="wrong-note-date">{note.at}</span>
              </div>
              <div className="wrong-note-actions">
                <button
                  type="button"
                  className="practice-secondary"
                  onClick={() => setRetry({ skillId: note.skillId, seed: note.seed, key })}
                >
                  똑같은 문제 다시
                </button>
                <button
                  type="button"
                  className="practice-secondary"
                  onClick={() => setRetry({ skillId: note.skillId, key: `${key}:similar` })}
                >
                  비슷한 문제
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {retry ? (
        <div className="wrong-notes-retry">
          <button type="button" className="practice-secondary" onClick={() => setRetry(null)}>
            닫기
          </button>
          <PracticeRunner
            key={retry.key}
            skillId={retry.skillId}
            initialSeed={retry.seed}
            onOutcome={onOutcome}
          />
        </div>
      ) : null}
    </div>
  );
}
