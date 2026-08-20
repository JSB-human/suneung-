/**
 * 길에서 "지금 칸으로 데려갈지" 판단하는 규칙.
 *
 * 컴포넌트에서 떼어 낸 이유는 이 판단이 브라우저 없이 확인할 수 있어야 하기
 * 때문이다. 실제 스크롤 동작은 화면이 있어야 볼 수 있지만, 언제 스크롤할지
 * 정하는 규칙은 순수한 계산이라 검사할 수 있다.
 */

export type ScrollDecisionInput = {
  /** 이 탭이 지금 보이는가. 숨은 탭은 위치가 없어 스크롤해도 소용없다. */
  isActive: boolean;
  /** 현재 칸을 찾았는가. 다 끝냈으면 현재 칸이 없다. */
  hasCurrentNode: boolean;
  /** 현재 칸의 화면 기준 세로 위치(px). 음수면 위로 지나갔다는 뜻이다. */
  currentTop: number;
  /** 화면 높이(px). */
  viewportHeight: number;
};

/**
 * 스크롤해야 하면 true.
 *
 * 이미 화면 안에 있으면 움직이지 않는다. 시작한 지 얼마 안 된 사람은 현재
 * 칸이 목록 맨 위에 있는데, 그걸 화면 가운데로 끌어올리면 미쿠 카드와 이번
 * 주 카드가 위로 밀려 사라진다. 도와주려다 맥락을 뺏는 셈이다.
 */
export function shouldScrollToCurrent({
  isActive,
  hasCurrentNode,
  currentTop,
  viewportHeight,
}: ScrollDecisionInput): boolean {
  if (!isActive || !hasCurrentNode) {
    return false;
  }
  const isOnScreen = currentTop >= 0 && currentTop < viewportHeight;
  return !isOnScreen;
}
