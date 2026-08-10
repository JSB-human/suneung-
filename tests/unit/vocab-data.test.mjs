import assert from "node:assert/strict";
import test from "node:test";
import { VOCAB_WORDS } from "../../app/vocab-data.ts";

const HANGUL = /[가-힣]/;

// 예문이 표제어를 실제로 쓰는지 볼 때 허용할 불규칙 변화형.
// 규칙 변화(-s/-ed/-ing 등)는 buildForms가 자동으로 만든다.
const IRREGULAR_FORMS = {
  be: ["am", "is", "are", "was", "were", "been", "being"],
  break: ["broke", "broken", "breaking"],
  bring: ["brought"],
  build: ["built"],
  buy: ["bought"],
  catch: ["caught"],
  choose: ["chose", "chosen"],
  do: ["does", "did", "done"],
  draw: ["drew", "drawn"],
  drive: ["drove", "driven"],
  fall: ["fell", "fallen"],
  feed: ["fed"],
  feel: ["felt"],
  find: ["found"],
  forget: ["forgot", "forgotten"],
  forgive: ["forgave", "forgiven"],
  get: ["got", "gotten"],
  give: ["gave", "given"],
  go: ["goes", "went", "gone"],
  grow: ["grew", "grown"],
  have: ["has", "had", "having"],
  hide: ["hid", "hidden"],
  hold: ["held"],
  keep: ["kept"],
  know: ["knew", "known"],
  lead: ["led"],
  learn: ["learnt"],
  leave: ["left"],
  lend: ["lent"],
  lose: ["lost"],
  make: ["made"],
  mean: ["meant"],
  meet: ["met"],
  pay: ["paid"],
  ride: ["rode", "ridden"],
  ring: ["rang", "rung"],
  rise: ["rose", "risen"],
  seek: ["sought"],
  sell: ["sold"],
  send: ["sent"],
  shine: ["shone"],
  speak: ["spoke", "spoken"],
  spend: ["spent"],
  spread: ["spreading"],
  stand: ["stood"],
  steal: ["stole", "stolen"],
  stick: ["stuck"],
  strike: ["struck"],
  swim: ["swam", "swum"],
  take: ["took", "taken"],
  teach: ["taught"],
  tell: ["told"],
  think: ["thought"],
  throw: ["threw", "thrown"],
  understand: ["understood"],
  wake: ["woke", "woken"],
  wear: ["wore", "worn"],
  win: ["won"],
  write: ["wrote", "written"],
};

/** 표제어에서 예문에 나올 수 있는 형태들을 만든다. */
function buildForms(word) {
  const base = word.toLowerCase();
  const forms = new Set([base]);
  const add = (form) => forms.add(form);

  add(`${base}s`);
  add(`${base}es`);
  add(`${base}ed`);
  add(`${base}d`);
  add(`${base}ing`);
  add(`${base}er`);
  add(`${base}est`);
  add(`${base}ly`);
  add(`${base}n`);

  if (base.endsWith("e")) {
    const stem = base.slice(0, -1);
    for (const suffix of ["ing", "ed", "es", "er", "est", "al", "ion", "ation", "y"]) {
      add(stem + suffix);
    }
  }
  if (base.endsWith("y")) {
    const stem = base.slice(0, -1);
    for (const suffix of ["ies", "ied", "ier", "iest", "ily", "iness"]) {
      add(stem + suffix);
    }
  }
  if (base.endsWith("ic")) {
    add(`${base}ally`);
  }
  if (base.endsWith("le")) {
    add(`${base.slice(0, -1)}y`);
  }
  // stop -> stopped / stopping 처럼 자음을 겹치는 경우.
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base)) {
    const doubled = base + base.at(-1);
    for (const suffix of ["ed", "ing", "er", "est"]) {
      add(doubled + suffix);
    }
  }
  for (const irregular of IRREGULAR_FORMS[base] ?? []) {
    add(irregular);
  }
  return forms;
}

function tokenize(sentence) {
  return new Set(sentence.toLowerCase().replace(/[^a-z]+/g, " ").trim().split(" "));
}

test("every vocabulary entry has a unique id", () => {
  const ids = VOCAB_WORDS.map((word) => word.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], [], `duplicate ids: ${[...new Set(duplicates)].join(", ")}`);
});

test("every vocabulary entry has the required fields filled in", () => {
  for (const word of VOCAB_WORDS) {
    assert.ok(word.id?.trim(), `missing id: ${JSON.stringify(word)}`);
    assert.ok(word.word?.trim(), `${word.id} has no word`);
    assert.ok(word.meaning?.trim(), `${word.id} has no meaning`);
    assert.ok(word.example?.trim(), `${word.id} has no example`);
    assert.ok(word.exampleTranslation?.trim(), `${word.id} has no translation`);
    assert.ok(word.tags?.length > 0, `${word.id} has no tags`);
  }
});

test("no two entries teach the same word", () => {
  const words = VOCAB_WORDS.map((entry) => entry.word.toLowerCase());
  const duplicates = words.filter((word, index) => words.indexOf(word) !== index);
  assert.deepEqual([...new Set(duplicates)], [], `duplicate words: ${[...new Set(duplicates)].join(", ")}`);
});

test("every id is lowercase so the rendered-html counter keeps matching", () => {
  for (const word of VOCAB_WORDS) {
    assert.match(word.id, /^[a-z-]+$/, `${word.id} must be lowercase letters and hyphens only`);
  }
});

test("every example actually uses its own word", () => {
  for (const entry of VOCAB_WORDS) {
    const tokens = tokenize(entry.example);
    const forms = [...buildForms(entry.word)];
    const used = forms.some((form) => tokens.has(form));
    assert.ok(
      used,
      `${entry.id}: example does not use "${entry.word}" -> ${JSON.stringify(entry.example)}`,
    );
  }
});

test("every example stays short enough for a beginner to parse", () => {
  for (const entry of VOCAB_WORDS) {
    const length = entry.example.trim().split(/\s+/).length;
    assert.ok(
      length >= 4 && length <= 14,
      `${entry.id}: example should be 4-14 words, found ${length} -> ${JSON.stringify(entry.example)}`,
    );
  }
});

test("meanings and translations are written in Korean", () => {
  for (const entry of VOCAB_WORDS) {
    assert.match(entry.meaning, HANGUL, `${entry.id}: meaning must contain Hangul`);
    assert.match(entry.exampleTranslation, HANGUL, `${entry.id}: translation must contain Hangul`);
  }
});

test("every entry is tagged with a known stage", () => {
  for (const entry of VOCAB_WORDS) {
    assert.equal(entry.stage, 1, `${entry.id}: stage 1 단어만 실려 있어야 한다`);
  }
});

// 1단계 목표는 500개다. 아직 집필 중이라 현재 확보량을 하한으로 둔다.
// 이 숫자는 단어를 추가할 때마다 올리고, 500에 도달하면 500으로 고정한다.
// 하한을 두는 이유는 집필이 끝나서가 아니라 이미 쓴 것이 지워지지 않게 하기 위해서다.
const STAGE_ONE_TARGET = 500;
const STAGE_ONE_CURRENT = 469;

test("stage 1 does not lose words it already has", () => {
  const stageOne = VOCAB_WORDS.filter((entry) => entry.stage === 1);
  assert.ok(
    stageOne.length >= STAGE_ONE_CURRENT,
    `stage 1 regressed: expected at least ${STAGE_ONE_CURRENT}, found ${stageOne.length}`,
  );
  assert.ok(
    stageOne.length <= STAGE_ONE_TARGET,
    `stage 1 exceeded its target of ${STAGE_ONE_TARGET}; move the extras to stage 2`,
  );
});
