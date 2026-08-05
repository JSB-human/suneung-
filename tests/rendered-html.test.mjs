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

test("server-renders the first-step study dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(html, /<title>첫칸 \| 노베이스 수능 학습 코치<\/title>/i);
  assert.match(html, /첫칸/);
  assert.match(html, /오늘 할 일/);
  assert.match(html, /국어 문장의 뼈대 20분/);
  assert.match(html, /영어 필수 어휘 10개 15분/);
  assert.match(html, /수학 수와 식 다시 보기 25분/);
  assert.match(html, /25분 타이머 시작/);
  assert.match(html, /바로 공부하기/);
  for (const tabLabel of ["홈", "로드맵", "공부", "기록"]) {
    assert.match(html, new RegExp(`>${tabLabel}<`));
  }
  assert.match(html, /2027 EBS 수능개념/);
  assert.match(html, /EBS 수능 빌드업/);
  assert.match(html, /EBS 수능특강 Light/);
  assert.equal((html.match(/target="_blank"/g) ?? []).length, 4);
  assert.equal((html.match(/rel="noreferrer noopener"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps client state, dates, dialogs, and EBS links safe", async () => {
  const [component, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/IpsiCoachApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(component, /localStorage/);
  assert.match(component, /first-step-study-v1/);
  assert.match(component, /schemaVersion: 1/);
  assert.match(component, /getFullYear\(\)/);
  assert.match(component, /getMonth\(\) \+ 1/);
  assert.match(component, /getDate\(\)/);
  assert.doesNotMatch(component, /toISOString\(/);
  assert.match(component, /element\.inert = true/);
  assert.match(component, /element\.inert = false/);
  assert.match(component, /event\.key !== "Tab"/);
  assert.match(component, /previouslyFocusedElementRef\.current\?\.focus\(\)/);
  assert.equal((component.match(/aria-live="polite"/g) ?? []).length, 1);
  assert.equal(
    (component.match(/https:\/\/www\.ebsi\.co\.kr\/ebs\/pot\/potg\/retrieveSeriesSubjectList\.ebs/g) ?? [])
      .length,
    3,
  );
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noreferrer noopener"/);
  assert.doesNotMatch(component, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(layout, /x-forwarded-host|requestHeaders\.get\("host"\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../cloudflare-env.d.ts", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("../public/favicon.svg", import.meta.url)));
});
