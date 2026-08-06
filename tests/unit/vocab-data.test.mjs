import assert from "node:assert/strict";
import test from "node:test";
import { VOCAB_WORDS } from "../../app/vocab-data.ts";

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
