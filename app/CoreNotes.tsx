"use client";

import { useMemo, useState } from "react";
import {
  CORE_NOTES,
  EBS_LINKS,
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  type SubjectKey,
} from "./study-content";

type NoteFilter = SubjectKey | "all" | "saved";

export type CoreNotesProps = {
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
};

const FILTER_LABEL: Record<NoteFilter, string> = {
  all: "전체",
  korean: "국어",
  english: "영어",
  math: "수학",
  saved: "저장한 노트",
};

export default function CoreNotes({ bookmarks, onToggleBookmark }: CoreNotesProps) {
  const [activeFilter, setActiveFilter] = useState<NoteFilter>("all");
  const [query, setQuery] = useState("");

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return CORE_NOTES.filter((note) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "saved" && bookmarks.includes(note.id)) ||
        note.subject === activeFilter;
      const searchableText = [
        note.title,
        note.category,
        note.oneLine,
        note.formula ?? "",
        note.mistake,
        ...note.essentials,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeFilter, bookmarks, query]);

  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">개념 · 공식 · 실수 방지</p>
          <h1>핵심 노트</h1>
          <p>외워야 할 것과 이해해야 할 것을 나눠 보고, 자주 틀리는 지점까지 한 카드에 정리했습니다.</p>
        </div>
      </div>

      <section className="panel-block" aria-label="핵심 노트 찾기">
        <div className="note-toolbar">
          <label className="search-field">
            개념 검색
            <input
              type="search"
              value={query}
              placeholder="예: 인수분해, 관계사, 화자"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="note-filters" aria-label="과목 필터">
            {(["all", ...SUBJECT_KEYS, "saved"] as NoteFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-chip ${activeFilter === filter ? "is-active" : ""}`}
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {FILTER_LABEL[filter]}
              </button>
            ))}
          </div>
        </div>

        <div className="note-grid">
          {visibleNotes.map((note) => {
            const isSaved = bookmarks.includes(note.id);
            return (
              <details key={note.id} className={`note-card subject-${note.subject}`}>
                <summary>
                  <div className="note-card-title">
                    <span>{SUBJECT_GUIDES[note.subject].label} · {note.category}</span>
                    <strong>{note.title}</strong>
                    <p>{note.oneLine}</p>
                  </div>
                  <span className="chevron" aria-hidden="true">⌄</span>
                </summary>
                <div className="note-body">
                  <section className="note-section">
                    <h4>꼭 기억할 것</h4>
                    <ul className="essential-list">
                      {note.essentials.map((essential) => <li key={essential}>{essential}</li>)}
                    </ul>
                  </section>
                  {note.formula ? (
                    <section className="note-section">
                      <h4>공식 · 구조</h4>
                      <div className="formula-box">{note.formula}</div>
                    </section>
                  ) : null}
                  <div className="mistake-box"><strong>자주 하는 실수</strong><br />{note.mistake}</div>
                  <div className="practice-box"><strong>1분 확인</strong><br />{note.microPractice}</div>
                  <button
                    type="button"
                    className={`bookmark-button ${isSaved ? "is-active" : ""}`}
                    aria-pressed={isSaved}
                    onClick={() => onToggleBookmark(note.id)}
                  >
                    {isSaved ? "저장됨 · 다시 눌러 해제" : "내 핵심 노트에 저장"}
                  </button>
                </div>
              </details>
            );
          })}
        </div>

        {visibleNotes.length === 0 ? (
          <div className="trainer-empty-library">
            <p>조건에 맞는 노트가 없습니다.</p>
            <p>검색어를 줄이거나 전체 필터를 선택해 보세요.</p>
          </div>
        ) : null}
      </section>

      <section className="panel-block" style={{ marginTop: 14 }}>
        <div className="section-heading">
          <div>
            <h2>기초 다음은 EBS로</h2>
            <p>현재 단계에 맞는 공식 입문 과정부터 연결합니다.</p>
          </div>
        </div>
        <div className="ebs-grid">
          {EBS_LINKS.map((link) => (
            <a
              key={link.subject}
              className={`ebs-card subject-${link.subject}`}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="subject-badge">{SUBJECT_GUIDES[link.subject].shortLabel}</span>
              <span>
                <strong>{link.title}</strong>
                <span>{link.description}</span>
              </span>
              <b>열기 ↗</b>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
