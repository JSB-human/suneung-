"use client";

import { useMemo, useState } from "react";
import {
  CORE_NOTES,
  EBS_LINKS,
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  SUBJECT_MEDIA_LINKS,
  type SubjectKey,
} from "./study-content";

type NoteFilter = SubjectKey | "all" | "saved";

export type CoreNotesProps = {
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
  subject?: SubjectKey;
  embedded?: boolean;
};

const FILTER_LABEL: Record<NoteFilter, string> = {
  all: "전체",
  korean: "국어",
  english: "영어",
  math: "수학",
  saved: "저장한 노트",
};

export default function CoreNotes({ bookmarks, onToggleBookmark, subject, embedded = false }: CoreNotesProps) {
  const [activeFilter, setActiveFilter] = useState<NoteFilter>("all");
  const [query, setQuery] = useState("");

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return CORE_NOTES.filter((note) => {
      const matchesFilter = subject
        ? note.subject === subject
        : activeFilter === "all" ||
          (activeFilter === "saved" && bookmarks.includes(note.id)) ||
          note.subject === activeFilter;
      const searchableText = [
        note.title,
        note.category,
        note.oneLine,
        note.formula ?? "",
        note.mistake,
        note.microPractice,
        ...note.essentials,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeFilter, bookmarks, query, subject]);

  const visibleEbsLinks = subject
    ? EBS_LINKS.filter((link) => link.subject === subject)
    : EBS_LINKS;

  return (
    <>
      {!embedded ? <div className="page-intro">
        <div>
          <p className="eyebrow">개념 · 공식 · 실수 방지</p>
          <h1>핵심 노트</h1>
          <p>외워야 할 것과 이해해야 할 것을 나눠 보고, 자주 틀리는 지점까지 한 카드에 정리했습니다.</p>
        </div>
      </div> : null}

      <section className={`panel-block notes-panel ${embedded ? "is-embedded" : ""}`} aria-label="핵심 노트 찾기">
        <div className="note-toolbar">
          <label className="search-field">
            {subject ? `${SUBJECT_GUIDES[subject].label} 노트 검색` : "개념 검색"}
            <input
              type="search"
              value={query}
              placeholder="예: 인수분해, 관계사, 화자"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {!subject ? <div className="note-filters" aria-label="과목 필터">
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
          </div> : null}
        </div>

        <div className="note-grid">
          {visibleNotes.map((note, index) => {
            const isSaved = bookmarks.includes(note.id);
            return (
              <details key={note.id} className={`note-card subject-${note.subject}`} open={embedded && index < 1 && !query ? true : undefined}>
                <summary>
                  <div className="note-card-title">
                    <span>{SUBJECT_GUIDES[note.subject].label} · {note.category}</span>
                    <strong>{note.title}</strong>
                    <p>{note.oneLine}</p>
                  </div>
                  <span className="chevron" aria-hidden="true">펼치기</span>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <a
                      className="ebs-link"
                      style={{ background: "#1d4ed8", color: "#ffffff", borderColor: "#1d4ed8" }}
                      href={note.ebsUrl || SUBJECT_MEDIA_LINKS[note.subject].ebsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      🎓 EBSi 공식 강좌 ↗
                    </a>
                    <a
                      className="ebs-link"
                      style={{ background: "#dc2626", color: "#ffffff", borderColor: "#dc2626" }}
                      href={note.youtubeChannelUrl || SUBJECT_MEDIA_LINKS[note.subject].youtubeChannelUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      📺 YouTube {note.youtubeChannelTitle || SUBJECT_MEDIA_LINKS[note.subject].youtubeChannelTitle} ↗
                    </a>
                  </div>
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

      <section className={`panel-block ebs-rail ${embedded ? "is-embedded" : ""}`} style={{ marginTop: 14 }}>
        <div className="section-heading">
          <div>
            <h2>🎥 EBS & YouTube 추천 무료 특강</h2>
            <p>사이트에서 핵심 개념을 익힌 뒤 공식 강좌와 대표 유튜브 특강 영상으로 바로 이어서 공부하세요.</p>
          </div>
        </div>
        <div className="ebs-grid">
          {visibleEbsLinks.map((link) => (
            <a
              key={link.id || link.subject}
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
              <b>시청 ↗</b>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
