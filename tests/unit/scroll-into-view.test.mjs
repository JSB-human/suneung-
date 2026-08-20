import assert from "node:assert/strict";
import test from "node:test";

import { shouldScrollToCurrent } from "../../app/path/scroll-into-view.ts";

const VIEWPORT = 812;

function input(overrides = {}) {
  return {
    isActive: true,
    hasCurrentNode: true,
    currentTop: 4130,
    viewportHeight: VIEWPORT,
    ...overrides,
  };
}

test("진도가 나가 현재 칸이 화면 밖이면 데려간다", () => {
  // 영어 길은 6000px가 넘는다. 25칸쯤 하면 현재 칸이 4000px 아래에 있다.
  assert.equal(shouldScrollToCurrent(input({ currentTop: 4130 })), true);
});

test("시작한 지 얼마 안 됐으면 움직이지 않는다", () => {
  // 현재 칸이 이미 첫 화면 안에 있다. 여기서 가운데로 끌어올리면 미쿠 카드와
  // 이번 주 카드가 위로 밀려 사라진다.
  assert.equal(shouldScrollToCurrent(input({ currentTop: 300 })), false);
  assert.equal(shouldScrollToCurrent(input({ currentTop: 0 })), false);
});

test("화면 경계를 정확히 가른다", () => {
  assert.equal(shouldScrollToCurrent(input({ currentTop: VIEWPORT - 1 })), false);
  assert.equal(shouldScrollToCurrent(input({ currentTop: VIEWPORT })), true);
});

test("위로 지나간 칸도 데려간다", () => {
  // 스크롤을 내렸다가 탭을 옮겨 오면 현재 칸이 화면 위로 벗어나 있다.
  assert.equal(shouldScrollToCurrent(input({ currentTop: -500 })), true);
});

test("숨은 탭에서는 스크롤하지 않는다", () => {
  // 탭은 숨겨질 뿐 마운트된 채로 남는다. 숨은 요소는 위치가 없어 그때 스크롤을
  // 걸어도 아무 일이 일어나지 않는다 — 원래 이것 때문에 자동 스크롤이 죽어 있었다.
  assert.equal(shouldScrollToCurrent(input({ isActive: false })), false);
});

test("다 끝냈으면 데려갈 곳이 없다", () => {
  assert.equal(shouldScrollToCurrent(input({ hasCurrentNode: false })), false);
});
