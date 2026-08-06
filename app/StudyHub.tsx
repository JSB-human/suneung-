"use client";

import type { ReactNode } from "react";
import CoreNotes from "./CoreNotes";
import FoundationReference from "./FoundationReference";
import {
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  type SubjectKey,
} from "./study-content";

type StudyHubProps = {
  selectedSubject: SubjectKey;
  onSelectSubject: (subject: SubjectKey) => void;
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
  knowledgeContent: ReactNode;
};

const STARTING_POINT: Record<SubjectKey, { title: string; description: string }> = {
  korean: {
    title: "문장 뼈대 → 독서 구조 → 문학 갈래",
    description: "한 문장의 주어·서술어부터 시작해 독서와 문학의 근거 찾기까지 이어집니다.",
  },
  english: {
    title: "듣기 → 단어 → 구문 → 독해·문법",
    description: "앞부분 듣기와 기본 어휘를 먼저 잡고, 문장 구조를 거쳐 긴 글 읽기로 확장합니다.",
  },
  math: {
    title: "수와 식 → 방정식 → 함수 → 도형·확률",
    description: "공식만 외우지 않고 필요한 선수 개념, 뜻, 예제, 문제 순서로 배웁니다.",
  },
};

export default function StudyHub({
  selectedSubject,
  onSelectSubject,
  bookmarks,
  onToggleBookmark,
  knowledgeContent,
}: StudyHubProps) {
  const guide = SUBJECT_GUIDES[selectedSubject];
  const start = STARTING_POINT[selectedSubject];

  return (
    <>
      <div className="page-intro study-page-intro">
        <div>
          <p className="eyebrow">설명부터 문제까지 이 안에서</p>
          <h1>국영수 개념 학습실</h1>
          <p>처음 보는 인1이님도 괜찮습니다. 쉬운 설명을 읽고, 예제를 따라 한 뒤, 짧은 문제로 바로 확인하세요.</p>
        </div>
      </div>

      <div className="subject-switch study-subject-switch" role="tablist" aria-label="학습 과목">
        {SUBJECT_KEYS.map((subject) => (
          <button
            key={subject}
            id={`study-subject-${subject}`}
            type="button"
            role="tab"
            className={`subject-chip subject-${subject} ${selectedSubject === subject ? "is-active" : ""}`}
            aria-selected={selectedSubject === subject}
            onClick={() => onSelectSubject(subject)}
          >
            {SUBJECT_GUIDES[subject].label}
          </button>
        ))}
      </div>

      <section className={`study-start-card subject-${selectedSubject}`} aria-labelledby={`study-subject-${selectedSubject}`}>
        <span className="subject-badge" aria-hidden="true">{guide.shortLabel}</span>
        <div>
          <p>{guide.eyebrow}</p>
          <h2>{start.title}</h2>
          <p>{start.description}</p>
        </div>
        <ol className="study-flow" aria-label="개념 학습 순서">
          <li><span>1</span><strong>핵심 이해</strong><small>왜 그런지 읽기</small></li>
          <li><span>2</span><strong>예제 따라가기</strong><small>한 줄씩 이유 확인</small></li>
          <li><span>3</span><strong>문제로 확인</strong><small>틀려도 해설 보기</small></li>
        </ol>
      </section>

      <section className="study-detail-section" aria-label={`${guide.label} 기초 교과서`}>
        <div className="content-section-heading">
          <span>START HERE</span>
          <div><h2>처음부터 읽는 {guide.label} 기초 교과서</h2><p>쉬운 설명, 한 줄 틀, 미니 예제, 30초 확인을 한 묶음으로 공부합니다.</p></div>
        </div>
        <FoundationReference key={selectedSubject} subject={selectedSubject} />
      </section>

      <section className="study-detail-section" aria-label={`${guide.label} 상세 개념 학습`}>
        <div className="content-section-heading">
          <span>KNOWLEDGE MAP</span>
          <div><h2>{guide.label} 상세 개념과 연습</h2><p>큰 단원부터 세부 개념까지 펼쳐서 공부하고 완료를 기록하세요.</p></div>
        </div>
        {knowledgeContent}
      </section>

      <section className="study-detail-section" aria-label={`${guide.label} 빠른 핵심 정리`}>
        <div className="content-section-heading">
          <span>QUICK NOTE</span>
          <div><h2>시험 전 다시 보는 핵심</h2><p>공식·구조·자주 하는 실수를 짧게 복습합니다.</p></div>
        </div>
        <CoreNotes
          bookmarks={bookmarks}
          onToggleBookmark={onToggleBookmark}
          subject={selectedSubject}
          embedded
        />
      </section>
    </>
  );
}
