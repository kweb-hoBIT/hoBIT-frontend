import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { lang } from '../i18n/lang';
import { setEnglish, setKorean } from '../redux/languageSlice';
import { toggleMenu } from '../redux/menuSlice';


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
        <span className="md:hidden">{isKorean ? '정보대학(학부) 호빗' : i18n.headerTitle}</span>
        <span className="hidden md:inline">{i18n.headerTitle}</span>
      </p>

      {/* 오른쪽 끝은 글자라 아이콘(안쪽 여백 있음)보다 바깥에 붙어 보임 → 조금 더 띄워 좌우 균형 */}
      <nav className="flex-1 basis-0 flex justify-end items-center gap-[16px] md:gap-[24px] lg:gap-[28px] pr-[2px] md:pr-[6px]" aria-label={isKorean ? '설정' : 'Settings'}>
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
