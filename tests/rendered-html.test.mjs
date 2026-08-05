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
  assert.match(html, /수능人 파트너 능이/);
  assert.match(html, /2028 수능 D-/);
  assert.match(html, /3분만 해보기/);
  assert.match(html, /가장 쉬운 한 칸/);
  assert.match(html, /오늘의 60분/);
  assert.match(html, /문장 뼈대 표시하기/);
  assert.match(html, /오늘의 단어 복습/);
  assert.match(html, /부호와 분수 계산/);
  assert.match(html, /국어(?:<!-- -->)? 기초 12주/);
  assert.match(html, /국어 기초 역량 지식 지도/);
  assert.match(html, /문장 성분과 중심 문장/);
  assert.match(html, /수능人 단어 트레이너/);
  assert.match(html, /10개 복습 시작/);
  assert.match(html, /새 단어/);
  for (const tabLabel of ["오늘", "로드맵", "핵심노트", "단어", "기록"]) {
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
  assert.match(component, /schemaVersion: 2/);
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
  assert.match(coach, /수능人 파트너 능이/);
  assert.match(coach, /포인트는 틀렸다고 줄지 않고/);
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
  const [content, mathData, mathMap, languageData, languageMap, trainer, vocabulary, notes, roadmap, css, coachCss] = await Promise.all([
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

  for (const chapter of ["읽기 기초", "독서\/비문학", "문학", "언어", "화법\/작문\/매체", "문제 적용\/EBS", "어휘\/발음", "듣기", "문장 문법", "구문 독해", "독해 유형", "EBS\/실전"]) {
    assert.match(languageData, new RegExp(chapter));
  }
  assert.ok((languageData.match(/selfCheckQuestion:/g) ?? []).length >= 25);
  assert.match(languageData, /듣기 파트와 읽기 파트를 중심/);
  assert.match(languageMap, /createEmptyLanguageKnowledgeMapValue/);
  assert.match(languageMap, /completedConceptIds/);
  assert.match(languageMap, /correctQuestionIds/);
  assert.match(languageMap, /괜찮아요\. 지금 발견해서 이득이에요/);
  assert.match(roadmap, /languageContent/);

  const vocabularyCount = (vocabulary.match(/\n\s+id: "[a-z-]+",/g) ?? []).length;
  assert.ok(vocabularyCount >= 40, `expected at least 40 words, found ${vocabularyCount}`);
  for (const rating of ["again", "hard", "good", "easy"]) {
    assert.match(trainer, new RegExp(`"${rating}"`));
  }
  assert.match(trainer, /수능人 단어 트레이너/);
  assert.match(trainer, /dueDate/);
  assert.match(trainer, /intervalDays/);
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
  assert.match(coachCss, /\.coach-mascot/);
  assert.match(coachCss, /\.encouragement-bubble/);
  assert.match(coachCss, /@media \(max-width: 390px\)/);
});
