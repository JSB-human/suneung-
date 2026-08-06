"use client";

import {
  EBS_LINKS,
  ROADMAPS,
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  SUBJECT_MEDIA_LINKS,
  type SubjectKey,
} from "./study-content";

export type RoadmapViewProps = {
  selectedSubject: SubjectKey;
  onSelectSubject: (subject: SubjectKey) => void;
  completedUnitIds: string[];
  onToggleUnit: (unitId: string) => void;
  onOpenNotes: () => void;
};

export default function RoadmapView({
  selectedSubject,
  onSelectSubject,
  completedUnitIds,
  onToggleUnit,
  onOpenNotes,
}: RoadmapViewProps) {
  const guide = SUBJECT_GUIDES[selectedSubject];
  const units = ROADMAPS[selectedSubject];
  const completedCount = units.filter((unit) => completedUnitIds.includes(unit.id)).length;
  const subjectProgress = Math.round((completedCount / units.length) * 100);
  const activeEbsLink = EBS_LINKS.find((link) => link.subject === selectedSubject);
  const currentUnit = units.find((unit) => !completedUnitIds.includes(unit.id)) ?? units.at(-1);

  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">큰 지도에서 오늘 한 칸까지</p>
          <h1>과목별 로드맵</h1>
          <p>단원을 순서대로 외우는 표가 아니라, 앞에서 배운 것이 다음 개념에 어떻게 이어지는지 보여 줍니다.</p>
        </div>
      </div>

      <div className="subject-switch" role="tablist" aria-label="로드맵 과목">
        {SUBJECT_KEYS.map((subject) => (
          <button
            key={subject}
            id={`roadmap-subject-${subject}`}
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

      <section
        className="subject-guide"
        role="tabpanel"
        aria-labelledby={`roadmap-subject-${selectedSubject}`}
      >
        <div>
          <p className="eyebrow">{guide.eyebrow}</p>
          <h3>{guide.label} 공부법</h3>
          <p>{guide.promise}</p>
        </div>
        <div>
          <ul className="method-list">
            {guide.method.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="weekly-rule">{guide.weeklyRule}</div>
        </div>
      </section>

      <div className="curriculum-notice">
        2022 개정 교육과정은 순차 적용 중이며 2028학년도 수능부터 국어·수학 선택과목이 없는 통합형 체제가 적용됩니다. 이 로드맵은 수험 연도와 관계없이 먼저 필요한 기초를 중심으로 구성했습니다.
      </div>

      <section className="roadmap-now" aria-label={`${guide.label} 현재 학습 위치`}>
        <div><span>지금 위치</span><strong>{currentUnit ? `${currentUnit.week}주 · ${currentUnit.title}` : "모든 주차 완료"}</strong></div>
        <div><span>다음 통과 기준</span><strong>{currentUnit?.checkpoint ?? "누적 복습으로 유지하기"}</strong></div>
        <button type="button" className="primary-action" onClick={onOpenNotes}>개념 학습실에서 시작</button>
      </section>

      <section className="panel-block roadmap-panel" aria-label={`${guide.label} 12주 로드맵`}>
          <div className="section-heading">
            <div>
              <h2>{guide.label} 기초 12주</h2>
              <p>완료 {completedCount}/{units.length} · {subjectProgress}%</p>
            </div>
            <button type="button" className="quiet-action" onClick={onOpenNotes}>개념 학습실</button>
          </div>

          <div className="roadmap-timeline">
            {units.map((unit) => {
              const isComplete = completedUnitIds.includes(unit.id);
              return (
                <details
                  key={unit.id}
                  className={`roadmap-unit subject-${selectedSubject} ${isComplete ? "is-complete" : ""}`}
                  open={unit.id === currentUnit?.id ? true : undefined}
                >
                  <summary>
                    <span className="week-badge">{unit.week}주</span>
                    <span className="unit-heading">
                      <span>{unit.phase}</span>
                      <strong>{unit.title}</strong>
                    </span>
                    <span className="chevron" aria-hidden="true">⌄</span>
                  </summary>
                  <div className="unit-body">
                    <div className="unit-goal"><strong>이번 주 목표</strong><br />{unit.goal}</div>
                    {unit.summaryKeyPoints && unit.summaryKeyPoints.length > 0 ? (
                      <div className="unit-summary-box">
                        <strong>📌 이번 주차 핵심 요점정리</strong>
                        <ul>
                          {unit.summaryKeyPoints.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="unit-columns">
                      <section className="unit-section">
                        <h4>배울 것</h4>
                        <ul>{unit.learn.map((item) => <li key={item}>{item}</li>)}</ul>
                      </section>
                      <section className="unit-section">
                        <h4>하루 30~60분 루틴</h4>
                        <ol>{unit.routine.map((item) => <li key={item}>{item}</li>)}</ol>
                      </section>
                    </div>
                    <div className="checkpoint"><strong>다음 단계 조건</strong><br />{unit.checkpoint}</div>
                    <div className="unit-actions">
                      <button
                        type="button"
                        className={`complete-button ${isComplete ? "is-active" : ""}`}
                        aria-pressed={isComplete}
                        onClick={() => onToggleUnit(unit.id)}
                      >
                        {isComplete ? "완료됨 · 다시 열기" : "이 단원 완료"}
                      </button>
                      <button type="button" className="secondary-action" onClick={onOpenNotes}>
                        연결 개념 학습하기
                      </button>
                      <a
                        className="ebs-link"
                        style={{ background: "#1d4ed8", color: "#ffffff", borderColor: "#1d4ed8" }}
                        href={unit.ebsUrl || activeEbsLink?.href || SUBJECT_MEDIA_LINKS[selectedSubject].ebsUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        🎓 EBSi 공식 강좌 ↗
                      </a>
                      <a
                        className="ebs-link"
                        style={{ background: "#dc2626", color: "#ffffff", borderColor: "#dc2626" }}
                        href={unit.youtubeChannelUrl || SUBJECT_MEDIA_LINKS[selectedSubject].youtubeChannelUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        📺 YouTube {unit.youtubeChannelTitle || SUBJECT_MEDIA_LINKS[selectedSubject].youtubeChannelTitle} ↗
                      </a>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
      </section>
    </>
  );
}
