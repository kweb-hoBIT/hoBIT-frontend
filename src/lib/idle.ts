/** 브라우저가 한가할 때 실행 (requestIdleCallback이 없으면 잠시 뒤) — 다음에 쓸 화면 코드를 미리 받아 둘 때 */
export const onIdle = (cb: () => void, timeout = 2500): (() => void) => {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
};

/** import()를 한 번만 부르고 같은 Promise를 재사용 — React.lazy와 미리 받기가 같은 요청을 씀 */
export const once = <T,>(load: () => Promise<T>): (() => Promise<T>) => {
  let p: Promise<T> | null = null;
  return () => {
    if (!p) {
      p = load().catch((e) => {
        p = null; // 실패하면 다음에 다시 시도
        throw e;
      });
    }
    return p;
  };
};
