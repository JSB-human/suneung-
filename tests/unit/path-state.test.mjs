import assert from "node:assert/strict";
import test from "node:test";
import { getNodesForSubject } from "../../app/path/path-nodes.ts";
import {
  EMPTY_PATH_STATE,
  completeNode,
  getNodeStatus,
  getNextNode,
  getSubjectProgress,
  normalizePathState,
} from "../../app/path/path-state.ts";

const firstMath = getNodesForSubject("math")[0];
const secondMath = getNodesForSubject("math")[1];

test("normalizePathState survives junk", () => {
  assert.deepEqual(normalizePathState(undefined), EMPTY_PATH_STATE);
  assert.deepEqual(normalizePathState(null), EMPTY_PATH_STATE);
  assert.deepEqual(normalizePathState({ completedNodeIds: "nope" }).completedNodeIds, []);
});

test("normalizePathState drops unknown node ids", () => {
  const state = normalizePathState({ completedNodeIds: [firstMath.id, "no-such-node"] });
  assert.deepEqual(state.completedNodeIds, [firstMath.id]);
});

test("only the first node is unlocked at the start", () => {
  assert.equal(getNodeStatus(EMPTY_PATH_STATE, firstMath.id), "current");
  assert.equal(getNodeStatus(EMPTY_PATH_STATE, secondMath.id), "locked");
});

test("completing a node unlocks the next one", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(getNodeStatus(state, firstMath.id), "done");
  assert.equal(getNodeStatus(state, secondMath.id), "current");
});

test("scoring below two out of three flags review but still unlocks", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 1, 3);
  assert.equal(getNodeStatus(state, firstMath.id), "done");
  assert.ok(state.needsReviewNodeIds.includes(firstMath.id));
  assert.equal(getNodeStatus(state, secondMath.id), "current", "진행을 막으면 안 된다");
});

test("scoring two out of three does not flag review", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 2, 3);
  assert.deepEqual(state.needsReviewNodeIds, []);
});

test("completing the same node twice does not duplicate", () => {
  let state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  state = completeNode(state, firstMath.id, 3, 3);
  assert.equal(state.completedNodeIds.filter((id) => id === firstMath.id).length, 1);
});

test("re-completing a flagged node clears the review flag", () => {
  let state = completeNode(EMPTY_PATH_STATE, firstMath.id, 1, 3);
  state = completeNode(state, firstMath.id, 3, 3);
  assert.deepEqual(state.needsReviewNodeIds, []);
});

test("completeNode does not mutate its input", () => {
  const before = JSON.stringify(EMPTY_PATH_STATE);
  completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(JSON.stringify(EMPTY_PATH_STATE), before);
});

test("getNextNode returns the first unfinished node of a subject", () => {
  assert.equal(getNextNode(EMPTY_PATH_STATE, "math")?.id, firstMath.id);
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(getNextNode(state, "math")?.id, secondMath.id);
});

test("getNextNode returns null when a subject is finished", () => {
  let state = EMPTY_PATH_STATE;
  for (const node of getNodesForSubject("math")) {
    state = completeNode(state, node.id, 3, 3);
  }
  assert.equal(getNextNode(state, "math"), null);
});

test("getSubjectProgress counts done over total", () => {
  const total = getNodesForSubject("math").length;
  assert.deepEqual(getSubjectProgress(EMPTY_PATH_STATE, "math"), { done: 0, total });
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.deepEqual(getSubjectProgress(state, "math"), { done: 1, total });
});
