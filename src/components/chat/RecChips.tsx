import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sendFaqById, sendRecommendedQuestion } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import { THEME_CHANGE_EVENT } from '../Header';

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

// widthClass: 위 카드 줄과 같은 폭 (기본은 카드 한 장 폭)
const RecChips: React.FC<{ title: string; items: RecItem[]; widthClass?: string }> = ({ title, items, widthClass = CARD_WIDTH_1 }) => {
  const dispatch = useDispatch();
  const listRef = useRef<HTMLDivElement>(null);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

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
  const baseDelay = replay > 0 ? REPLAY_DELAY : APPEAR_DELAY;

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
      <p className="text-f-sm font-5medium text-ink-2 mb-[8px] md:mb-[10px] hobit-appear-late" style={{ animationDelay: `${baseDelay}s` }}>{title}</p>
      <div ref={listRef} className="flex flex-wrap gap-[8px] md:gap-[10px]">
        {items.map((item, i) => {
          const label = !isKorean && item.text_en ? item.text_en : item.text;
          return (
          <button
            key={`${item.intent_id}-${item.text}`}
            title={label}
            style={{ animationDelay: `${baseDelay + APPEAR_STAGGER * (i + 1)}s` }}
            onClick={() =>
              item.faq_id
                ? dispatch(sendFaqById({ id: item.faq_id, query: label }))
                : dispatch(sendRecommendedQuestion(label))
            }
            className="hobit-appear-late max-w-full text-left break-keep px-[14px] md:px-[18px] py-[7px] md:py-[9px] rounded-[18px] md:rounded-[22px] text-f-chip leading-[1.35] font-5medium text-ink bg-surface border border-line hover:border-accent-ink hover:text-accent-ink transition-colors"
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
