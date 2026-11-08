import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sendFaqById, sendRecommendedQuestion } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import { THEME_CHANGE_EVENT } from '../Header';
import { Skeleton } from '../ui/Skeleton';
import { revealRef } from '../../lib/reveal';

export type RecItem = {
  intent_id: string;
  intent_name: string;
  text: string;
  text_en?: string | null; // 영어 모드 표시용 (없으면 한국어 그대로)
  faq_id: number | null;
  reason?: 'next' | 'answer' | 'related' | 'popular';
};

/**
 * 추천 질문 칩 (SPRINT 추천 풀) — 가로로 흐르며 줄바꿈, 글자 크기 통일, 긴 질문도 잘리지 않고 칩 안에서 줄바꿈
 * 행정실 FAQ면 id로 바로 답변(LLM 없음), 아니면 질문으로 보냄
 */
// 답변 카드가 먼저 보이고 나서 칩이 나타나도록 — 제목 0.5초 뒤, 칩은 0.08초 간격으로 이어서
const APPEAR_DELAY = 0.5;
const APPEAR_STAGGER = 0.08;
// 한/영·나이트 모드를 바꿨을 때는 기다림 없이 바로 다시 촤라락
const REPLAY_DELAY = 0.05;

// 기본 폭 = 카드 한 장 (시작 화면). 대화 중에는 Chatting이 위 카드 줄 폭에 맞춰 넘겨줌
const CARD_WIDTH_1 = 'w-full max-w-[330px] md:max-w-[350px]';

// widthClass: 위 카드 줄과 같은 폭 (기본은 카드 한 장 폭), title이 없으면 제목 줄 없이 칩만 (자주 묻는 질문 답변)
// stacked: 한 줄에 하나씩 (시작 화면·자주 묻는 질문 — 위에서 아래로 읽는 목록). 대화 중 추천은 가로로 흐르게
// instant: 사용자가 직접 연 목록(카테고리 질문 등) — 답변을 기다릴 필요가 없으니 바로 나타나게
// reveal: 긴 목록(카테고리 질문·자주 묻는 질문) — 칩마다 화면에 들어올 때 나타남 (첫 화면 분량은 위에서부터 촤라락)
const RecChips: React.FC<{ title?: string; items: RecItem[]; widthClass?: string; stacked?: boolean; instant?: boolean; reveal?: boolean }> = ({
  title, items, widthClass = CARD_WIDTH_1, stacked = false, instant = false, reveal = false,
}) => {
  const dispatch = useDispatch();
  const listRef = useRef<HTMLDivElement>(null);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const isLoading = useSelector((state: RootState) => state.input.isLoading);

  // 언어·테마가 바뀌면 칩을 새로 그려 등장 효과를 다시 재생 (replay 값이 key로 쓰임)
  const [replay, setReplay] = useState(0);
  const firstLang = useRef(true);
  useEffect(() => {
    if (firstLang.current) {
      firstLang.current = false;
      return;
    }
    setReplay((r) => r + 1);
  }, [isKorean]);
  useEffect(() => {
    const onTheme = () => setReplay((r) => r + 1);
    window.addEventListener(THEME_CHANGE_EVENT, onTheme);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onTheme);
  }, []);
  const baseDelay = replay > 0 || instant ? REPLAY_DELAY : APPEAR_DELAY;

  // 줄바꿈된 칩은 브라우저가 가능한 최대 폭을 잡아 오른쪽이 비어 보임 →
  // 실제로 그려진 줄 중 가장 긴 줄 폭에 맞춰 칩 폭을 줄인다 (화면 크기가 바뀌면 다시 계산)
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const fit = () => {
      list.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
        btn.style.width = '';
        const text = btn.firstChild;
        if (!text) return;
        const range = document.createRange();
        range.selectNodeContents(text);
        const lines = Array.from(range.getClientRects());
        if (lines.length < 2) return;
        const widest = Math.max(...lines.map((r) => r.width));
        const cs = getComputedStyle(btn);
        const extra = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
          .reduce((sum, k) => sum + parseFloat(cs[k as keyof CSSStyleDeclaration] as string), 0);
        btn.style.width = `${Math.ceil(widest + extra) + 1}px`;
      });
    };
    fit();
    // 칩 폭을 바꾸면 목록 높이가 바뀌어 다시 감지됨 → 폭이 바뀔 때만, 다음 프레임에 다시 맞춤
    // (콜백 안에서 바로 바꾸면 "ResizeObserver loop" 경고가 개발 화면을 가렸음)
    let lastWidth = list.clientWidth;
    let raf = 0;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    observer.observe(list);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items, replay]);

  if (!items.length) return null;
  return (
    <div key={replay} className={`mt-[14px] md:mt-[18px] ${widthClass}`}>
      {title && (
        <p className="text-f-sm font-5medium text-ink-2 mb-[8px] md:mb-[10px] hobit-appear-late" style={{ animationDelay: `${baseDelay}s` }}>{title}</p>
      )}
      <div ref={listRef} className={`flex gap-[8px] md:gap-[10px] ${stacked ? 'flex-col items-start' : 'flex-wrap'}`}>
        {items.map((item, i) => {
          const label = !isKorean && item.text_en ? item.text_en : item.text;
          return (
          <button
            key={`${item.intent_id}-${item.text}`}
            ref={reveal ? revealRef : undefined}
            style={reveal ? undefined : { animationDelay: `${baseDelay + APPEAR_STAGGER * (i + 1)}s` }}
            disabled={isLoading}
            onClick={() =>
              item.faq_id
                ? dispatch(sendFaqById({ id: item.faq_id, query: label }))
                : dispatch(sendRecommendedQuestion(label))
            }
            className={`${reveal ? '' : 'hobit-appear-late'} max-w-full text-left break-keep px-[14px] md:px-[18px] py-[7px] md:py-[9px] rounded-[18px] md:rounded-[22px] text-f-chip leading-[1.35] font-5medium text-ink bg-surface border border-line hover:border-accent-ink hover:text-accent-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-ink`}
          >
            {label}
          </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(RecChips);

// 칩 자리표시 — 추천 질문을 받는 동안 같은 자리·비슷한 높이를 잡아 둠 (도착하면 아래 내용이 밀리지 않게)
const SKELETON_WIDTHS = ['78%', '62%', '86%', '54%'];
export const RecChipsSkeleton: React.FC<{ withTitle?: boolean; stacked?: boolean; count?: number; widthClass?: string }> = ({
  withTitle = true, stacked = true, count = 4, widthClass = CARD_WIDTH_1,
}) => (
  <div className={`mt-[14px] md:mt-[18px] ${widthClass}`} aria-hidden="true">
    {withTitle && <Skeleton className="mb-[8px] md:mb-[10px] h-[18px] w-[120px] rounded-full" />}
    <div className={`flex gap-[8px] md:gap-[10px] ${stacked ? 'flex-col items-start' : 'flex-wrap'}`}>
      {SKELETON_WIDTHS.slice(0, count).map((w, i) => (
        <Skeleton key={i} className="h-[35px] md:h-[41px] rounded-[18px] md:rounded-[22px]" style={{ width: stacked ? w : `${30 + (i % 3) * 12}%` }} />
      ))}
    </div>
  </div>
);
