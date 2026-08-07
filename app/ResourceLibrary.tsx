"use client";

import { useState } from "react";

export type ResourceCategory = "all" | "korean" | "english" | "math" | "inquiry";

export type ResourceItem = {
  id: string;
  category: "korean" | "english" | "math" | "inquiry";
  provider: "ebsi" | "youtube";
  title: string;
  instructorOrChannel: string;
  targetAudience: string;
  description: string;
  url: string;
  tags: string[];
};

export const STUDY_RESOURCES: ResourceItem[] = [
  // 국어 (Korean)
  {
    id: "ko-ebs-butterfly",
    category: "korean",
    provider: "ebsi",
    title: "EBSi 윤혜정의 개념의 나비효과 (2028 수능 입문)",
    instructorOrChannel: "EBSi 윤혜정 선생님",
    targetAudience: "전국 수험생 필독! 국어 독서·문학 기초 개념 정립",
    description: "시상의 전개, 소설 시점, 비문학 문단 구조, 문법 음운 변동까지 2028 수능 통합형 국어의 핵심 원리를 잡아줍니다.",
    url: "https://www.youtube.com/results?search_query=EBS+윤혜정+개념의+나비효과",
    tags: ["EBSi 공식", "국어 개념", "독서·문학"],
  },
  {
    id: "ko-yt-madkorean",
    category: "korean",
    provider: "youtube",
    title: "미친국어 - 노베이스 수능 국어 독해 원리",
    instructorOrChannel: "미친국어 YouTube",
    targetAudience: "글을 읽어도 머리에 남지 않는 노베이스 학생",
    description: "긴 지문에서 문장 뼈대 추려내기, 필자의 주장과 근거 분리하기, 문맥 속 어휘 추론 팁을 명쾌하게 해설합니다.",
    url: "https://www.youtube.com/results?search_query=미친국어+수능+기초",
    tags: ["YouTube 인기", "노베이스 특화", "비문학 독서"],
  },
  {
    id: "ko-ebs-pre",
    category: "korean",
    provider: "ebsi",
    title: "EBSi 고등예비과정 공통국어",
    instructorOrChannel: "EBSi 국어 대표강사진",
    targetAudience: "고1 공통국어 기초 및 2028 수능 연계 대비",
    description: "2028 개정 교육과정 공통국어 교과서 핵심 문항과 읽기 도구를 바탕으로 수능형 문제를 처음 연습하는 공식 과정입니다.",
    url: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005517",
    tags: ["EBSi 공식", "2028 공통국어", "기초 예습"],
  },

  // 수학 (Math)
  {
    id: "ma-ebs-50day",
    category: "math",
    provider: "ebsi",
    title: "EBS 50일 수학 (정승제 / 정종영 계통수학)",
    instructorOrChannel: "EBSi 정승제 / 정종영 선생님",
    targetAudience: "수학 구멍(부호, 계산, 인수분해, 함수)이 많은 노베이스",
    description: "초등 계산부터 중학 도형, 피타고라스, 고등 대수까지 수능 수학의 구멍을 50일 만에 연결해 주는 전설적인 강의입니다.",
    url: "https://www.youtube.com/results?search_query=EBS+50일+수학",
    tags: ["EBSi 공식", "계통수학", "50일 완성"],
  },
  {
    id: "ma-yt-mathmath1",
    category: "math",
    provider: "youtube",
    title: "@mathmath1 수학의샘 - 수능 기초 개념 강의",
    instructorOrChannel: "수학의샘 YouTube (@mathmath1)",
    targetAudience: "개념은 알지만 문제 적용이 안 되는 수험생",
    description: "일차·이차함수 그래프 해석, 판별식과 교점의 의미, 수능 빈출 유형 풀이 팁을 쉽고 깔끔하게 정리해 줍니다.",
    url: "https://www.youtube.com/@mathmath1",
    tags: ["YouTube 인기", "수능 기초", "문제 적용"],
  },
  {
    id: "ma-ebs-concept2028",
    category: "math",
    provider: "ebsi",
    title: "EBSi 2028 수능개념 대수 & 미적분Ⅰ",
    instructorOrChannel: "EBSi 수학 대표강사진",
    targetAudience: "2028 수능 공통 수학(대수, 미적분Ⅰ, 확통) 준비생",
    description: "개편된 2028 수능 공통 출제 범위인 대수, 미적분Ⅰ, 확률과 통계의 핵심 개념과 대표 기출 유형을 익힙니다.",
    url: "https://cloud-www.ebsi.co.kr/ebs/pot/potn/retrieveSbjtListByArea.ebs?categoryCode=A300",
    tags: ["EBSi 공식", "2028 통합수능", "대수·미적분Ⅰ"],
  },

  // 영어 (English)
  {
    id: "en-ebs-joo",
    category: "english",
    provider: "ebsi",
    title: "EBSi 주혜연의 해석공식 (직독직해 구문)",
    instructorOrChannel: "EBSi 주혜연 선생님",
    targetAudience: "긴 영어 문장만 보면 멍해지는 학생",
    description: "주어·동사 자리 찾기, 관계사절 묶기, to부정사/분사구문 직독직해 구문 공식을 체계적으로 훈련합니다.",
    url: "https://www.youtube.com/results?search_query=EBS+주혜연+해석공식",
    tags: ["EBSi 공식", "구문 독해", "직독직해"],
  },
  {
    id: "en-yt-studycore",
    category: "english",
    provider: "youtube",
    title: "스터디코어 - 수능 영어 구문독해 BASIC",
    instructorOrChannel: "스터디코어 YouTube",
    targetAudience: "단어만 나열해 감으로 찍는 노베이스 학생",
    description: "문장 끊어 읽기, 명사절/형용사절/부사절 구분법, 5초 판별 문법 팁을 스피디하게 전수합니다.",
    url: "https://www.youtube.com/results?search_query=스터디코어+구문독해+BASIC",
    tags: ["YouTube 인기", "구문 BASIC", "문장 구조 분석"],
  },
  {
    id: "en-ebs-pre",
    category: "english",
    provider: "ebsi",
    title: "EBSi 고등예비과정 공통영어",
    instructorOrChannel: "EBSi 영어 대표강사진",
    targetAudience: "수능 필수 어휘와 기초 독해를 병행하려는 학생",
    description: "수능 필수 어휘 1500+와 연계 지문을 바탕으로 독해력과 듣기 감각을 함께 끌어올리는 공식 입문 과정입니다.",
    url: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005455",
    tags: ["EBSi 공식", "수능 어휘", "독해 입문"],
  },

  // 탐구 +@ (Integrated Science / Social Studies)
  {
    id: "inq-ebs-science50",
    category: "inquiry",
    provider: "ebsi",
    title: "EBS 50일 통합과학 (2028 수능 필수 공통탐구)",
    instructorOrChannel: "EBSi 과학 대표강사진",
    targetAudience: "2028 수능 필수 응시과목 통합과학 기초 잡기",
    description: "물리학, 화학, 생명과학, 지구과학 핵심 개념을 통합하여 2028 수능 탐구영역 고득점 기틀을 마련합니다.",
    url: "https://www.youtube.com/results?search_query=EBS+50일+통합과학",
    tags: ["EBSi 공식", "2028 필수탐구", "통합과학"],
  },
  {
    id: "inq-ebs-social50",
    category: "inquiry",
    provider: "ebsi",
    title: "EBS 50일 통합사회 (2028 수능 필수 공통탐구)",
    instructorOrChannel: "EBSi 사회 대표강사진",
    targetAudience: "2028 수능 필수 응시과목 통합사회 기초 잡기",
    description: "지리, 사회·문화, 정치·법, 경제, 윤리 핵심 주제를 잇는 2028 통합사회 수능 개념 강좌입니다.",
    url: "https://www.youtube.com/results?search_query=EBS+50일+통합사회",
    tags: ["EBSi 공식", "2028 필수탐구", "통합사회"],
  },
];

export default function ResourceLibrary() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>("all");

  const filteredResources = STUDY_RESOURCES.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  return (
    <article className="panel-block" style={{ marginTop: 20, border: "2px solid #39c5bb", borderRadius: 20 }}>
      <div className="section-heading">
        <div>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#00a496", background: "#e6f9f8", padding: "3px 8px", borderRadius: 10 }}>
            2028 수능 통합형 대비 최신 자료실
          </span>
          <h2 style={{ marginTop: 6, fontSize: 19, color: "#0f172a", fontWeight: 900 }}>
            📚 EBSi 공식 강좌 & 2028 최신 학습 유튜브 맵
          </h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            2028 수능(국어·수학·영어·통합사회·통합과학) 대비 검증된 무료 학습 강좌와 채널을 엄선했습니다.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          className={`primary-action ${activeCategory === "all" ? "" : "secondary-action"}`}
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, fontWeight: 800 }}
          onClick={() => setActiveCategory("all")}
        >
          전체 보기 ({STUDY_RESOURCES.length})
        </button>
        <button
          type="button"
          className={`primary-action ${activeCategory === "korean" ? "" : "secondary-action"}`}
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, fontWeight: 800 }}
          onClick={() => setActiveCategory("korean")}
        >
          🇰🇷 국어 자료
        </button>
        <button
          type="button"
          className={`primary-action ${activeCategory === "math" ? "" : "secondary-action"}`}
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, fontWeight: 800 }}
          onClick={() => setActiveCategory("math")}
        >
          📐 수학 자료
        </button>
        <button
          type="button"
          className={`primary-action ${activeCategory === "english" ? "" : "secondary-action"}`}
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, fontWeight: 800 }}
          onClick={() => setActiveCategory("english")}
        >
          🇬🇧 영어 자료
        </button>
        <button
          type="button"
          className={`primary-action ${activeCategory === "inquiry" ? "" : "secondary-action"}`}
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, fontWeight: 800 }}
          onClick={() => setActiveCategory("inquiry")}
        >
          ⚡ 2028 탐구 (+통합사회/과학)
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {filteredResources.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 16,
              borderRadius: 16,
              background: "var(--surface-soft)",
              border: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: item.provider === "ebsi" ? "#ffffff" : "#ffffff",
                    background: item.provider === "ebsi" ? "#1d4ed8" : "#dc2626",
                  }}
                >
                  {item.provider === "ebsi" ? "🎓 EBSi 공식" : "📺 YouTube 최신"}
                </span>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{item.instructorOrChannel}</span>
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 900, color: "#0f172a", lineHeight: 1.4 }}>
                {item.title}
              </h3>
              <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#3b82f6", fontWeight: 800 }}>
                💡 추천 대상: {item.targetAudience}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {item.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 10, color: "#64748b", background: "rgba(0,0,0,0.04)", padding: "2px 6px", borderRadius: 6 }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="primary-action"
                style={{
                  minHeight: 32,
                  padding: "0 10px",
                  fontSize: 11,
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  background: item.provider === "ebsi" ? "#1d4ed8" : "#dc2626",
                  borderColor: item.provider === "ebsi" ? "#1d4ed8" : "#dc2626",
                }}
              >
                학습하기 ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
