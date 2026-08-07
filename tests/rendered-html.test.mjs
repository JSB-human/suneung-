import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the expanded mobile study coach", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(html, /<title>수능人 \| 국영수 노베이스 입시 로드맵<\/title>/i);
  assert.match(html, /인1이(?:<!-- -->)?님/);
  assert.match(html, /고1 기초 · 2028학년도 통합형/);
  assert.match(html, /수능人 파트너(?:<!-- -->)? · 하츠네 미쿠/);
  assert.match(html, /2028 수능 D-/);
  assert.match(html, /3분 집중/);
  assert.match(html, /가장 쉬운 한 칸/);
  // 오늘 탭은 미쿠 · 세 과목의 다음 칸 · 오늘의 단어 세 가지만 남는다.
  for (const label of ["국어", "영어", "수학"]) {
    assert.match(
      html,
      new RegExp(`${label}(?:<!-- -->)? 다음 칸`),
      `오늘 탭에 ${label}의 다음 칸이 있어야 한다`,
    );
  }
  assert.match(html, /오늘의 단어/);
  assert.match(html, /수능人 단어 트레이너/);
  assert.match(html, /10개 복습 시작/);
  assert.match(html, /새 단어/);
  // 과목 탭은 서브탭 없이 길 하나만 보여 준다.
  assert.match(html, /칸 완료/);
  assert.match(html, /긴 문장도 주어·서술어부터/, "국어 길 1번 칸");
  assert.match(html, /단어는 뜻 하나보다 문장 가족으로/, "영어 길 1번 칸");
  assert.match(html, /부호·분수·지수 연산/, "수학 길 1번 칸");
  // 잠긴 칸도 제목이 렌더되어야 전체 그림이 보인다.
  assert.match(html, /일차방정식에서 부등식과 좌표 해석으로/, "수학 길 마지막 칸");
  // 길 맨 위의 이번 주 카드 — 로드맵은 길에서 파생된다.
  assert.match(html, /이번 주 (?:\d+칸|몫은 끝냈어|복습)/, "이번 주 카드");
  assert.match(html, /수능까지 전체 로드맵 보기/, "로드맵 펼치기 버튼");
  assert.match(html, /기초 다지기|개념 완성|유형 적응|실전/, "단계 이름");
  // 서브탭은 완전히 사라졌다.
  assert.doesNotMatch(html, /🌱 기초 도서관/);
  assert.doesNotMatch(html, /12주 독해 로드맵/);
  assert.doesNotMatch(html, /50일수학 지식 지도/);
  for (const tabLabel of ["오늘", "국어", "영어·단어", "수학", "기록"]) {
    assert.match(html, new RegExp(`>${tabLabel}<`));
  }
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("preserves and migrates local study state safely", async () => {
  const [component, layout, packageJson, coach] = await Promise.all([
    readFile(new URL("../app/IpsiCoachApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/EncouragementCoach.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(component, /first-step-study-v2/);
  assert.match(component, /first-step-study-v1/);
  assert.match(component, /migrateLegacyState/);
  assert.match(component, /schemaVersion: 4/);
  assert.match(component, /normalizePathState/, "v4 마이그레이션이 있어야 한다");
  assert.match(component, /PathView/);
  // 로드맵은 렌더 중 new Date()를 부르지 않고 오늘 날짜를 프롭으로 받는다.
  assert.equal(
    component.match(/todayKey=\{todayKey\}/g)?.length,
    3,
    "세 과목 길이 전부 오늘 날짜를 프롭으로 받아야 한다",
  );
  assert.match(component, /migrateVocabIntoReview/, "v2 단어 진도가 복습 큐로 옮겨져야 한다");
  // 복습 큐 화면(TodayPractice)이 기록 탭에서 다시 렌더되어야 한다 — 오늘 탭에서 빠졌다고 통째로 사라지면 안 된다.
  assert.match(component, /import TodayPractice from "\.\/practice\/TodayPractice"/, "TodayPractice를 다시 임포트해야 한다");
  assert.match(component, /<TodayPractice/, "TodayPractice가 실제로 렌더되어야 한다");
  assert.match(component, /listDueKeys/, "오늘 탭에서 복습 개수를 세어야 한다");
  // 서브탭 상태는 전부 사라졌다.
  assert.doesNotMatch(component, /koreanSubTab|englishSubTab|mathSubTab/);
  // 동생 데이터는 화면에서 빠져도 저장소에는 남아야 한다.
  for (const field of ["completedTasks", "completedUnitIds", "bookmarkedNoteIds", "studyLog", "wrongNotes"]) {
    assert.match(component, new RegExp(field), `${field}가 v4에서도 보존되어야 한다`);
  }
  assert.match(component, /recordOutcome/);
  assert.match(component, /normalizeLanguageState/);
  assert.match(component, /getDaysUntil2028Csat/);
  assert.match(component, /year: 2027, monthIndex: 10, day: 18/);
  assert.match(component, /Date\.UTC/);
  assert.match(component, /setTimerPreset\(3\)/);
  assert.match(component, /"math-foundation": "ma-01"/);
  assert.match(component, /"math-core": "ma-06"/);
  assert.match(component, /"math-ebs": "ma-12"/);
  assert.match(component, /setCalendarRevision/);
  assert.match(component, /const currentDateKey = getLocalDateKey\(\)/);
  assert.match(component, /addStudyMinutes\(\s*previous,\s*getLocalDateKey\(\)/);
  assert.doesNotMatch(component, /toISOString\(/);
  assert.match(component, /element\.inert = true/);
  assert.match(component, /element\.inert = false/);
  assert.match(component, /event\.key !== "Tab"/);
  assert.match(component, /previouslyFocusedElementRef\.current\?\.focus\(\)/);
  assert.match(component, /window\.confirm/);
  assert.doesNotMatch(component, /dangerouslySetInnerHTML/);
  assert.match(coach, /수능人 파트너 · 하츠네 미쿠/);
  assert.match(layout, /https:\/\/first-kan-study\.blessedjsb\.chatgpt\.site/);
  assert.match(layout, /applicationName: "수능人"/);
  assert.match(layout, /siteName: "수능人"/);
  assert.match(layout, /width: 1672/);
  assert.match(layout, /height: 941/);
  assert.doesNotMatch(layout, /x-forwarded-host|requestHeaders\.get\("host"\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../cloudflare-env.d.ts", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("ships detailed curricula, practice, SRS vocabulary, and official EBS links", async () => {
  const [app, content, mathData, mathMap, languageData, languageMap, trainer, vocabulary, notes, roadmap, css, coachCss, foundation, foundationView, visualCss] = await Promise.all([
    readFile(new URL("../app/IpsiCoachApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/study-content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/math-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/MathKnowledgeMap.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/language-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/LanguageKnowledgeMap.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/VocabTrainer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/vocab-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CoreNotes.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/RoadmapView.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/coach.css", import.meta.url), "utf8"),
    readFile(new URL("../app/foundation-reference.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/FoundationReference.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/visual-refresh.css", import.meta.url), "utf8"),
  ]);

  for (const subjectPrefix of ["ko-", "en-"]) {
    const unitCount = (content.match(new RegExp(`id: "${subjectPrefix}\\d{2}"`, "g")) ?? []).length;
    assert.equal(unitCount, 12);
  }

  for (const chapter of ["수와 연산", "문자와 식/방정식", "함수", "도형", "경우의 수/확률", "고교 공통수학 연결"]) {
    assert.match(mathData, new RegExp(chapter.replace("/", "\\/")));
  }
  assert.ok((mathData.match(/practiceQuestions:/g) ?? []).length >= 12);
  assert.match(mathData, /corePrinciples/);
  assert.match(mathData, /workedExample/);
  assert.match(mathMap, /role="status"/);
  assert.match(mathMap, /aria-live="polite"/);
  assert.match(mathMap, /correctQuestionIds/);
  assert.match(mathMap, /rel="noreferrer noopener"/);
  assert.match(mathMap, /renderConceptPractice/);

  for (const chapter of ["읽기 기초", "독서\/비문학", "문학", "언어", "화법\/작문\/매체", "문제 적용\/EBS", "어휘\/발음", "듣기", "문장 문법", "구문 독해", "독해 유형", "EBS\/실전"]) {
    assert.match(languageData, new RegExp(chapter));
  }
  assert.ok((languageData.match(/selfCheckQuestion:/g) ?? []).length >= 25);
  assert.match(languageData, /듣기 파트와 읽기 파트를 중심/);
  assert.match(languageMap, /createEmptyLanguageKnowledgeMapValue/);
  assert.match(languageMap, /completedConceptIds/);
  assert.match(languageMap, /correctQuestionIds/);
  assert.match(languageMap, /괜찮아요\. 지금 발견해서 이득이에요/);
  assert.match(roadmap, /개념 학습실에서 시작/);
  assert.doesNotMatch(roadmap, /languageContent|mathContent/);

  const capsuleCounts = {
    korean: (foundation.match(/subject: "korean"/g) ?? []).length,
    english: (foundation.match(/subject: "english"/g) ?? []).length,
    math: (foundation.match(/subject: "math"/g) ?? []).length,
  };
  assert.deepEqual(capsuleCounts, { korean: 10, english: 11, math: 10 });
  for (const field of ["beginnerExplanation", "keyPoints", "workedExample", "commonTrap", "quickCheck"]) {
    assert.match(foundation, new RegExp(field));
  }
  assert.match(foundation, /대수·미적분Ⅰ·확률과 통계/);
  assert.match(foundationView, /기초 도서관/);
  assert.match(foundationView, /30초 확인/);
  assert.match(foundationView, /틀렸어도 괜찮아요/);
  // 캡슐은 이제 서브탭이 아니라 길 위의 칸으로 나온다. 세 과목 모두 길이 걸려 있어야 한다.
  assert.match(app, /import PathView from ".\/path\/PathView"/);
  for (const subject of ["korean", "english", "math"]) {
    assert.match(
      app,
      new RegExp(`subject="${subject}"[\\s\\S]{0,160}?onCompleteNode=\\{handleCompleteNode\\}`),
      `${subject} 탭이 길을 렌더링해야 한다`,
    );
  }
  // 후속 계획이 다시 쓰므로 컴포넌트 파일 자체는 남아 있어야 한다.
  for (const file of ["RoadmapView", "CoreNotes", "FoundationReference", "LanguageKnowledgeMap", "MathKnowledgeMap"]) {
    await access(new URL(`../app/${file}.tsx`, import.meta.url));
  }

  const vocabularyCount = (vocabulary.match(/id: "[a-z-]+",/g) ?? []).length;
  assert.ok(vocabularyCount >= 40, `expected at least 40 words, found ${vocabularyCount}`);
  for (const rating of ["again", "hard", "good", "easy"]) {
    assert.match(trainer, new RegExp(`"${rating}"`));
  }
  assert.match(trainer, /수능人 단어 트레이너/);
  assert.match(trainer, /dueDate/);
  assert.match(trainer, /intervalDays/);
  assert.match(trainer, /from "\.\/practice\/review-queue"/);
  assert.doesNotMatch(trainer, /function buildNextProgress/);
  assert.match(trainer, /favorite/);
  assert.match(trainer, /role="group"/);
  assert.match(trainer, /aria-pressed/);
  assert.doesNotMatch(trainer, /role="tab"/);
  assert.match(trainer, /type="search"/);

  const officialEbsPattern = /https:\/\/www\.ebsi\.co\.kr\/ebs\//;
  assert.match(content, officialEbsPattern);
  assert.match(mathData, officialEbsPattern);
  assert.match(languageData, /https:\/\/(?:cloud-www\.)?ebsi\.co\.kr\/ebs\//);
  assert.match(notes, /target="_blank"/);
  assert.match(notes, /rel="noreferrer noopener"/);
  assert.match(roadmap, /다음 단계 조건/);

  assert.match(css, /--korean:/);
  assert.match(css, /--english:/);
  assert.match(css, /--math:/);
  assert.match(css, /grid-template-columns: repeat\(5, 1fr\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /--primary: #1d4ed8/);
  assert.match(css, /--accent: #dbeafe/);
  assert.match(visualCss, /\.today-agenda/);
  assert.match(css, /--topbar-bg: rgba\(248, 250, 252, 0\.88\)/);
  assert.match(coachCss, /\.coach-mascot/);
  assert.match(coachCss, /\.encouragement-bubble/);
  assert.match(coachCss, /@media \(max-width: 390px\)/);
});

test("keeps Vercel and Sites build outputs isolated", async () => {
  const [packageSource, vercelSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);
  const packageJson = JSON.parse(packageSource);
  const vercelConfig = JSON.parse(vercelSource);

  assert.equal(packageJson.scripts.build, "vinext build");
  assert.equal(packageJson.scripts["build:vercel"], "next build");
  assert.equal(vercelConfig.buildCommand, "npm run build:vercel");
  assert.equal(vercelConfig.framework, "nextjs");
  assert.ok(!("outputDirectory" in vercelConfig));
});

test("wires the infinite practice engine into the math path", async () => {
  const [nodeRunner, pathNodes, runner, safeGenerate, registry, skillMap] = await Promise.all([
    readFile(new URL("../app/path/NodeRunner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/path/path-nodes.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/PracticeRunner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/safe-generate.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/generators/registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/skill-map.ts", import.meta.url), "utf8"),
  ]);

  // 생성기가 붙은 칸은 서브탭이 아니라 칸 화면에서 PracticeRunner를 재사용한다.
  assert.match(nodeRunner, /import PracticeRunner from "\.\.\/practice\/PracticeRunner"/);
  assert.match(nodeRunner, /content\.skillId/);
  assert.match(pathNodes, /SKILL_MAP/, "길 노드가 생성기 skillId를 이어받아야 한다");
  assert.match(runner, /개념 보기/);
  assert.match(runner, /힌트 보기/);
  assert.match(runner, /다음 문제/);
  assert.match(runner, /aria-live="polite"/);
  assert.match(runner, /useEffect/, "첫 문항은 마운트 후에 만들어야 한다 (하이드레이션)");
  assert.match(runner, /onOutcome\?\.\(/, "풀이 결과를 위로 보고해야 오답노트가 쌓인다");
  assert.match(runner, /startedAtRef/);
  assert.match(safeGenerate, /findQuestionViolations/);
  assert.match(registry, /unknown skillId/);

  for (const skillId of ["ma-frac-arith", "ma-linear-eq", "ma-poly-expand", "ma-factor", "ma-quad-eq"]) {
    assert.match(skillMap, new RegExp(`"${skillId}"`));
  }
});
