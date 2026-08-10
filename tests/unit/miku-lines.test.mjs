import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import {
  MIKU_EVENTS,
  MIKU_LINES,
  MISTAKE_LINES,
  getDefaultMikuLine,
  getMistakeLine,
  pickMikuLine,
} from "../../app/miku/miku-lines.ts";

const MOODS = ["cheerful", "encouraging", "proud", "worried", "sleepy"];
const EMOJI = /\p{Extended_Pictographic}/gu;

function countEmoji(text) {
  return (text.match(EMOJI) ?? []).length;
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(path)));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

// 태그 목록을 여기에 베껴 두면 생성기가 새 태그를 추가했을 때 조용히 어긋난다.
// 그래서 소스에서 직접 긁는다.
async function collectMistakeTagsFromSource() {
  const files = await collectSourceFiles(new URL("../../app/", import.meta.url));
  const tags = new Set();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/mistakeTag:\s*"([^"]+)"/g)) {
      tags.add(match[1]);
    }
  }
  return [...tags].sort();
}

test("스펙이 정한 11개 이벤트가 모두 있다", () => {
  assert.deepEqual(
    [...MIKU_EVENTS].sort(),
    [
      "comeback",
      "correct",
      "correctStreak3",
      "dailyFirst",
      "hintUsed",
      "lateNight",
      "levelUp",
      "sessionComplete",
      "sessionStart",
      "wrong",
      "wrongTwice",
    ],
  );
});

test("이벤트마다 대사가 5줄 이상 8줄 이하다", () => {
  for (const event of MIKU_EVENTS) {
    const lines = MIKU_LINES[event];
    assert.ok(Array.isArray(lines), `${event} 대사 뱅크가 있어야 한다`);
    assert.ok(lines.length >= 5, `${event}: ${lines.length}줄 (5줄 이상이어야 한다)`);
    assert.ok(lines.length <= 8, `${event}: ${lines.length}줄 (8줄 이하여야 한다)`);
  }
});

test("모든 기분에 뽑을 대사가 두 줄 이상 있다", () => {
  for (const event of MIKU_EVENTS) {
    for (const mood of MOODS) {
      const usable = MIKU_LINES[event].filter(
        (line) => !line.moods || line.moods.includes(mood),
      );
      assert.ok(usable.length >= 2, `${event}/${mood}: 후보 ${usable.length}줄`);
    }
  }
});

test("대사 id는 전부 다르다", () => {
  const ids = new Set();
  for (const event of MIKU_EVENTS) {
    for (const line of MIKU_LINES[event]) {
      assert.ok(!ids.has(line.id), `중복 id: ${line.id}`);
      ids.add(line.id);
    }
  }
});

test("대사 하나에 이모지는 한 개를 넘지 않는다", () => {
  for (const event of MIKU_EVENTS) {
    for (const line of MIKU_LINES[event]) {
      assert.ok(
        countEmoji(line.text) <= 1,
        `${line.id}: 이모지 ${countEmoji(line.text)}개 — "${line.text}"`,
      );
    }
  }
  for (const [tag, text] of Object.entries(MISTAKE_LINES)) {
    assert.ok(countEmoji(text) <= 1, `${tag}: 이모지가 너무 많다 — "${text}"`);
  }
});

test("대사는 비어 있지 않고 반말을 유지한다", () => {
  for (const event of MIKU_EVENTS) {
    for (const line of MIKU_LINES[event]) {
      assert.ok(line.text.trim().length > 0, `${line.id}: 빈 대사`);
      assert.doesNotMatch(line.text, /습니다|해요\.|하세요/, `${line.id}: 존댓말이 섞였다`);
    }
  }
});

test("코드에 존재하는 모든 mistakeTag에 전용 오답 대사가 있다", async () => {
  const tags = await collectMistakeTagsFromSource();
  assert.ok(tags.length >= 15, `소스에서 태그를 ${tags.length}개만 찾았다 — 스캔이 깨졌다`);
  const missing = tags.filter((tag) => getMistakeLine(tag) === null);
  assert.deepEqual(missing, [], `전용 대사가 없는 태그: ${missing.join(", ")}`);
});

test("모든 mistakeTag는 일반 오답 대사로 흘러가지 않는다", async () => {
  const tags = await collectMistakeTagsFromSource();
  const genericIds = new Set(MIKU_LINES.wrong.map((line) => line.id));
  for (const tag of tags) {
    const line = pickMikuLine({
      event: "wrong",
      mood: "encouraging",
      previousLineId: null,
      seed: 7,
      mistakeTag: tag,
    });
    assert.ok(!genericIds.has(line.id), `${tag}가 일반 대사로 떨어졌다`);
    assert.equal(line.text, MISTAKE_LINES[tag]);
  }
});

test("전용 오답 대사는 실수를 구체적으로 짚는다", async () => {
  const tags = await collectMistakeTagsFromSource();
  for (const tag of tags) {
    const text = getMistakeLine(tag);
    assert.ok(text.length >= 12, `${tag}: 대사가 너무 짧다 — "${text}"`);
    assert.doesNotMatch(text, /^아쉽다/, `${tag}: 일반적인 위로로 끝났다`);
  }
});

test("mistakeTag가 없으면 일반 오답 대사로 돌아간다", () => {
  for (const mistakeTag of [null, undefined, "", "존재하지-않는-태그"]) {
    const line = pickMikuLine({
      event: "wrong",
      mood: "worried",
      previousLineId: null,
      seed: 3,
      mistakeTag,
    });
    assert.ok(
      MIKU_LINES.wrong.some((candidate) => candidate.id === line.id),
      `${String(mistakeTag)}: 일반 대사가 나와야 한다`,
    );
  }
});

test("picker는 같은 입력에 항상 같은 대사를 낸다", () => {
  for (const event of MIKU_EVENTS) {
    for (const mood of MOODS) {
      for (const seed of [0, 1, 17, 4242]) {
        const input = { event, mood, previousLineId: null, seed };
        assert.equal(pickMikuLine(input).id, pickMikuLine({ ...input }).id);
      }
    }
  }
});

test("picker는 직전에 쓴 대사를 다시 뽑지 않는다", () => {
  for (const event of MIKU_EVENTS) {
    for (const mood of MOODS) {
      for (const line of MIKU_LINES[event]) {
        for (const seed of [0, 5, 31, 128, 997]) {
          const picked = pickMikuLine({
            event,
            mood,
            previousLineId: line.id,
            seed,
          });
          assert.notEqual(
            picked.id,
            line.id,
            `${event}/${mood}/seed ${seed}: 직전 대사가 다시 나왔다`,
          );
        }
      }
    }
  }
});

test("picker는 기분에 맞지 않는 대사를 고르지 않는다", () => {
  for (const event of MIKU_EVENTS) {
    for (const mood of MOODS) {
      for (let seed = 0; seed < 40; seed += 1) {
        const picked = pickMikuLine({ event, mood, previousLineId: null, seed });
        assert.ok(
          !picked.moods || picked.moods.includes(mood),
          `${event}/${mood}: ${picked.id}는 이 기분용이 아니다`,
        );
      }
    }
  }
});

test("picker는 시드가 다르면 대사를 바꾼다", () => {
  for (const event of MIKU_EVENTS) {
    const picked = new Set();
    for (let seed = 0; seed < 40; seed += 1) {
      picked.add(pickMikuLine({ event, mood: "encouraging", previousLineId: null, seed }).id);
    }
    assert.ok(picked.size >= 2, `${event}: 시드를 바꿔도 대사가 하나뿐이다`);
  }
});

test("getDefaultMikuLine은 서버 렌더에서도 쓸 수 있는 고정 대사를 준다", () => {
  const first = getDefaultMikuLine();
  assert.equal(first.id, getDefaultMikuLine().id);
  assert.ok(MIKU_LINES.sessionStart.some((line) => line.id === first.id));
});
