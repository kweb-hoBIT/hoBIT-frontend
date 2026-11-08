/** 움직임 줄이기(접근성 설정)를 켠 사용자 — 자동 스크롤·등장 효과를 즉시 처리 */
export const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};
