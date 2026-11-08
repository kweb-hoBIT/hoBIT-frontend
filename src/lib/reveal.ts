import { prefersReducedMotion } from './motion';

/**
 * 스크롤해서 화면에 들어오는 항목을 살짝 떠오르게 (카테고리 칸·FAQ 목록·출처 카드 등)
 *  - IntersectionObserver 하나를 모든 항목이 같이 씀 (항목마다 만들지 않음)
 *  - 한 번에 같이 들어온 항목은 위에서부터 0.05초 간격으로 "촤라락" (최대 0.4초)
 *  - 한 번 보인 항목은 다시 움직이지 않음 (관찰 해제)
 *  - 움직임 줄이기 설정이면 아무것도 하지 않음
 * 사용: <div ref={revealRef}> — 상태는 data-reveal 속성으로만 다루므로 React가 바꾸는 className과 부딪히지 않음
 *   wait(숨김) → in(나타나는 중, index.css) → done(효과 끝, 원래 transition 그대로)
 */
const STAGGER_MS = 50;
const MAX_DELAY_MS = 400;
const DURATION_MS = 420;

let observer: IntersectionObserver | null = null;
const watched = new Set<HTMLElement>();
let sinceSweep = 0;

const show = (el: HTMLElement, delay: number) => {
  el.style.setProperty('--reveal-delay', `${delay}ms`);
  el.dataset.reveal = 'in';
  window.setTimeout(() => {
    if (el.dataset.reveal !== 'in') return;
    el.dataset.reveal = 'done';
    el.style.removeProperty('--reveal-delay');
  }, delay + DURATION_MS + 50);
};

const getObserver = (): IntersectionObserver | null => {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;
  observer = new IntersectionObserver(
    (entries) => {
      const entering: IntersectionObserverEntry[] = [];
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (!el.isConnected) {
          observer?.unobserve(el);
          watched.delete(el);
        } else if (entry.isIntersecting) {
          entering.push(entry);
        }
      });
      // 같이 들어온 항목은 위→아래, 왼쪽→오른쪽 순서로 이어서
      entering.sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left
      );
      entering.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        observer?.unobserve(el);
        watched.delete(el);
        show(el, Math.min(i * STAGGER_MS, MAX_DELAY_MS));
      });
    },
    // 아래쪽 고정 입력창 뒤에 걸친 항목은 조금 더 올라온 뒤에 나타나게
    { rootMargin: '0px 0px -40px 0px', threshold: 0.01 }
  );
  return observer;
};

// 지워진 항목이 관찰 목록에 남지 않게 가끔 정리
const sweep = () => {
  watched.forEach((el) => {
    if (!el.isConnected) {
      observer?.unobserve(el);
      watched.delete(el);
    }
  });
};

/** ref로 넘기는 함수 — 항상 같은 참조라 처음 붙을 때 한 번만 호출됨 */
export const revealRef = (el: HTMLElement | null): void => {
  if (!el || el.dataset.reveal) return; // 이미 처리한 항목은 그대로 (다시 움직이지 않음)
  if (prefersReducedMotion()) return;
  const io = getObserver();
  if (!io) return;
  el.dataset.reveal = 'wait';
  watched.add(el);
  io.observe(el);
  if (++sinceSweep >= 60) {
    sinceSweep = 0;
    sweep();
  }
};
