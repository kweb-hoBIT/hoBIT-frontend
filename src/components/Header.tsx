import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { lang } from '../i18n/lang';
import { setEnglish, setKorean } from '../redux/languageSlice';
import { toggleMenu } from '../redux/menuSlice';
import { Program, setProgram } from '../redux/programSlice';


const THEME_KEY = 'hobit-theme';
// 테마가 바뀌었음을 알리는 이벤트 — 추천 칩 등이 등장 효과를 다시 재생
export const THEME_CHANGE_EVENT = 'hobit-theme-change';

// 아이콘은 hiyseo.com 블로그 네비바와 같은 선 아이콘 (stroke = 글자색)
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const MenuIcon = () => (
  <svg {...iconProps} className="wiggle-icon w-[26px] h-[26px] md:w-[30px] md:h-[30px] lg:w-[32px] lg:h-[32px]">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
const TranslateIcon = () => (
  <svg {...iconProps} className="wiggle-icon w-[24px] h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px]">
    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
  </svg>
);
const MoonIcon = () => (
  <svg {...iconProps} className="wiggle-icon w-[24px] h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px]">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);
// 학부(펼친 책) / 대학원(학사모) — 모바일 스위치 안 아이콘 (Lucide book-open · graduation-cap)
const BookIcon = () => (
  <svg {...iconProps} className="w-[18px] h-[18px]">
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </svg>
);
const CapIcon = () => (
  <svg {...iconProps} className="w-[18px] h-[18px]">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

/**
 * 학부 / 대학원 스위치 — 누르면 동그란 판이 옆으로 미끄러짐. 데스크톱은 글자, 모바일은 아이콘(책·학사모)
 * 바꾸면 짧은 안내를 띄움 (아이콘만으로는 뜻을 모를 수 있어서)
 */
const ProgramSwitch: React.FC<{ isKorean: boolean }> = ({ isKorean }) => {
  const dispatch = useDispatch();
  const program = useSelector((state: RootState) => state.program.value);
  const isLoading = useSelector((state: RootState) => state.input.isLoading);
  const grad = program === 'graduate';
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const choose = (next: Program) => {
    if (next === program || isLoading) return; // 답변 중에는 바꾸지 않음 (보낸 질문과 기준이 달라짐)
    dispatch(setProgram(next));
    const g = next === 'graduate';
    setToast(isKorean ? `${g ? '대학원' : '학부'} 기준으로 답할게요` : `Answering for ${g ? 'graduate' : 'undergraduate'} students`);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 1800);
  };
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const items: { value: Program; label: string; icon: React.ReactNode }[] = [
    { value: 'undergraduate', label: isKorean ? '학부' : 'Undergrad', icon: <BookIcon /> },
    { value: 'graduate', label: isKorean ? '대학원' : 'Graduate', icon: <CapIcon /> },
  ];

  return (
    <div className="relative">
      <div
        role="radiogroup"
        aria-label={isKorean ? '학부·대학원 선택' : 'Undergraduate or graduate'}
        className={`relative grid grid-cols-2 rounded-full bg-card p-[3px] ${isLoading ? 'opacity-60' : ''}`}
      >
        {/* 미끄러지는 판 */}
        <span
          aria-hidden
          className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-surface shadow-sm border border-line transition-transform duration-200 ease-out ${grad ? 'translate-x-full' : 'translate-x-0'}`}
        />
        {items.map((it) => {
          const on = it.value === program;
          return (
            <button
              key={it.value}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={it.label}
              title={it.label}
              disabled={isLoading}
              onClick={() => choose(it.value)}
              className={`relative z-[1] flex items-center justify-center rounded-full px-[9px] md:px-[14px] h-[30px] md:h-[34px] text-f-nav transition-colors outline-none focus-visible:ring-2 focus-visible:ring-line disabled:cursor-not-allowed ${
                on ? 'text-accent-ink font-6semibold' : 'text-ink-3 hover:text-ink-2 font-5medium'
              }`}
            >
              <span className="md:hidden">{it.icon}</span>
              <span className="hidden md:inline whitespace-nowrap">{it.label}</span>
            </button>
          );
        })}
      </div>
      {toast && (
        <div role="status" className="hobit-appear absolute right-0 top-full mt-[10px] whitespace-nowrap rounded-full bg-ink text-surface px-[14px] py-[6px] text-f-caption shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

const SunIcon = () => (
  <svg {...iconProps} className="wiggle-icon w-[24px] h-[24px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px]">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

/** 나이트 모드 — 처음 값은 public/index.html이 렌더 전에 정함 (저장값 > 시스템 설정) */
const useTheme = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const apply = (next: boolean) => {
    document.documentElement.classList.toggle('dark', next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#1c1c1f' : '#ffffff');
    setDark(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  // 직접 고른 적이 없으면 시스템 설정 변경을 따라감
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch {}
      if (!saved) apply(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    apply(!dark);
    try {
      localStorage.setItem(THEME_KEY, !dark ? 'dark' : 'light');
    } catch {}
  };
  return { dark, toggle };
};

const actionClass =
  'wiggle flex items-center gap-[6px] text-ink-2 hover:text-ink transition-colors text-f-nav font-5medium outline-none focus-visible:ring-2 focus-visible:ring-line rounded-[8px] px-[2px]';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const i18n = isKorean ? lang.ko : lang.en;
  const { dark, toggle } = useTheme();

  // 버튼 라벨은 "누르면 바뀔 상태" (블로그와 같은 방식)
  const langLabel = isKorean ? 'English' : '한국어';
  const themeLabel = dark ? 'Light' : 'Night'; // 테마 라벨은 언어와 관계없이 항상 영어

  return (
    <div className="h-[60px] md:h-[70px] bg-surface fixed top-0 left-0 w-full border-b border-line flex items-center z-50 px-[16px] md:px-[28px] lg:px-[36px]">
      <div className="flex-1 basis-0 flex justify-start">
        <button
          type="button"
          aria-label={isKorean ? '메뉴' : 'Menu'}
          onClick={() => dispatch(toggleMenu())}
          className={actionClass.replace('wiggle ', '')} // 메뉴 아이콘은 흔들지 않음
        >
          <MenuIcon />
        </button>
      </div>

      <p data-hobit-title className="shrink text-center font-7bold text-f-title text-ink whitespace-nowrap overflow-hidden text-ellipsis px-[8px]">
        <span className="md:hidden">{isKorean ? '정보대학 호빗' : 'hoBIT'}</span>
        <span className="hidden md:inline">{i18n.headerTitle}</span>
      </p>

      {/* 오른쪽 끝은 글자라 아이콘(안쪽 여백 있음)보다 바깥에 붙어 보임 → 조금 더 띄워 좌우 균형 */}
      <nav className="flex-1 basis-0 flex justify-end items-center gap-[12px] md:gap-[24px] lg:gap-[28px] pr-[2px] md:pr-[6px]" aria-label={isKorean ? '설정' : 'Settings'}>
        <ProgramSwitch isKorean={isKorean} />
        <button
          type="button"
          onClick={() => dispatch(isKorean ? setEnglish() : setKorean())}
          aria-label={isKorean ? 'Switch to English' : '한국어로 전환'}
          className={actionClass}
        >
          <TranslateIcon />
          <span className="hidden md:inline">{langLabel}</span>
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? (isKorean ? '라이트 모드로 전환' : 'Switch to light mode') : isKorean ? '나이트 모드로 전환' : 'Switch to night mode'}
          className={actionClass}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
          <span className="hidden md:inline">{themeLabel}</span>
        </button>
      </nav>
    </div>
  );
};

export default Header;
