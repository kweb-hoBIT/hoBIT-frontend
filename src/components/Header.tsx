import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { RootState } from '../redux/store';
import { lang } from '../i18n/lang';
import { setEnglish, setKorean } from '../redux/languageSlice';
import { toggleMenu } from '../redux/menuSlice';
import { Program, setProgram } from '../redux/programSlice';
import { preloadMenuContent } from './Modal';
import { appConfirm } from './ui/Dialog';
import { deleteProfile, getProfile } from '../api/query';


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

type SlideOption<T extends string> = { value: T; label: string; icon?: React.ReactNode };

/**
 * 슬라이딩 스위치 (두 칸) — 누르면 동그란 판이 옆으로 미끄러짐. 헤더의 학부/대학원, 설정 패널(계기판)의 세 스위치가 함께 씀
 * labels: always = 항상 글자, md = 태블릿 폭부터 글자(그 전엔 아이콘만)
 */
function SlideSwitch<T extends string>({ ariaLabel, options, value, onChange, disabled, labels = 'always', wide }: {
  ariaLabel: string;
  options: [SlideOption<T>, SlideOption<T>];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  labels?: 'always' | 'md';
  wide?: boolean; // 패널 안에서 칸을 넓게 (두 칸 같은 폭)
}) {
  const second = value === options[1].value;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`relative grid grid-cols-2 rounded-full bg-card p-[3px] ${wide ? 'w-full' : ''} ${disabled ? 'opacity-60' : ''}`}
    >
      <span
        aria-hidden
        className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-surface shadow-sm border border-line transition-transform duration-200 ease-out ${second ? 'translate-x-full' : 'translate-x-0'}`}
      />
      {options.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={it.label}
            title={it.label}
            disabled={disabled}
            onClick={() => !on && onChange(it.value)}
            className={`relative z-[1] flex items-center justify-center gap-[5px] rounded-full h-[30px] md:h-[34px] text-f-nav transition-colors outline-none focus-visible:ring-2 focus-visible:ring-line disabled:cursor-not-allowed ${
              wide ? 'px-[10px]' : 'px-[8px] md:px-[10px] xl:px-[14px]'
            } ${on ? 'text-accent-ink font-6semibold' : 'text-ink-3 hover:text-ink-2 font-5medium'}`}
          >
            {it.icon}
            <span className={`${labels === 'md' ? 'hidden md:inline' : 'inline'} whitespace-nowrap`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * 학부/대학원 바꾸기 — 답변 중에는 바꾸지 않고(보낸 질문과 기준이 달라짐), 바꾸면 짧은 안내.
 * 바꾸면 저장된 프로필(학과·학번 등)을 지움 — 학부 정보가 대학원 답변에(또는 반대로) 섞여 들어가지 않게.
 * 지울 정보가 있을 때만 먼저 물어봄 (비어 있으면 바로 바꿈). 대화 기록은 남김
 */
const useProgramChooser = (isKorean: boolean) => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const program = useSelector((state: RootState) => state.program.value);
  const isLoading = useSelector((state: RootState) => state.input.isLoading);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // 프로필 확인·삭제 중 (두 번 눌러 겹치지 않게)
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const showToast = (text: string) => {
    setToast(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 1800);
  };
  const choose = async (next: Program) => {
    if (next === program || isLoading || busy) return;
    const g = next === 'graduate';
    setBusy(true);
    try {
      // 저장된 프로필은 서버(세션)에 있음 — 바꾸기 직전에 확인 (조회 실패면 지울 수도 없으니 그냥 바꿈)
      const stored = await getProfile().catch(() => null);
      const filled = Object.entries(stored?.profile ?? {})
        .filter(([, v]) => v !== null && v !== '')
        .map(([field]) => field);
      if (filled.length > 0) {
        const ok = await appConfirm(
          isKorean
            ? `${g ? '대학원으로' : '학부로'} 바꾸면 입력한 프로필 정보(학과·학번 등)가 초기화돼요. 바꿀까요?`
            : `Switching to ${g ? 'graduate' : 'undergraduate'} will reset your saved profile (department, admission year, etc.). Switch?`,
          { confirmLabel: isKorean ? '바꾸기' : 'Switch' }
        );
        // 확인을 기다리는 사이 질문을 보냈으면 바꾸지 않음 (보낸 질문과 기준이 달라짐)
        if (!ok || store.getState().input.isLoading) return;
        // 항목별로 지움 — 전체 삭제(field 없이)는 대화 기록까지 지워서 쓰지 않음
        try {
          await Promise.all(filled.map((field) => deleteProfile(field)));
        } catch {
          showToast(isKorean ? '프로필을 지우지 못했어요. 잠시 뒤 다시 시도해 주세요.' : "Couldn't reset your profile. Please try again.");
          return;
        }
      }
      dispatch(setProgram(next));
      showToast(isKorean ? `${g ? '대학원' : '학부'} 기준으로 답할게요` : `Answering for ${g ? 'graduate' : 'undergraduate'} students`);
    } finally {
      setBusy(false);
    }
  };
  const options: [SlideOption<Program>, SlideOption<Program>] = [
    { value: 'undergraduate', label: isKorean ? '학부' : 'Undergrad', icon: <BookIcon /> },
    { value: 'graduate', label: isKorean ? '대학원' : 'Graduate', icon: <CapIcon /> },
  ];
  // 확인·삭제 중에도 스위치를 잠금 (답변 중과 같은 모양)
  return { program, isLoading: isLoading || busy, toast, choose, options };
};

const Toast: React.FC<{ text: string | null }> = ({ text }) =>
  text ? (
    <div role="status" className="hobit-appear absolute right-0 top-full mt-[10px] whitespace-nowrap rounded-full bg-ink text-surface px-[14px] py-[6px] text-f-caption shadow-lg">
      {text}
    </div>
  ) : null;

/** 헤더의 학부/대학원 스위치 (넓은 화면) — 아이콘 + 글자(태블릿 폭부터) */
const ProgramSwitch: React.FC<{ isKorean: boolean }> = ({ isKorean }) => {
  const { program, isLoading, toast, choose, options } = useProgramChooser(isKorean);
  return (
    <div className="relative">
      <SlideSwitch
        ariaLabel={isKorean ? '학부·대학원 선택' : 'Undergraduate or graduate'}
        options={options}
        value={program}
        onChange={choose}
        disabled={isLoading}
        labels="md"
      />
      <Toast text={toast} />
    </div>
  );
};

const SlidersIcon = () => (
  <svg {...iconProps} className="wiggle-icon w-[24px] h-[24px]">
    <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
  </svg>
);
const SunSmall = () => (
  <svg {...iconProps} className="w-[18px] h-[18px]">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const MoonSmall = () => (
  <svg {...iconProps} className="w-[18px] h-[18px]">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

/**
 * 좁은 휴대폰 — 오른쪽 버튼 셋(학부/대학원·언어·테마)을 아이콘 하나로 합침.
 * 누르면 아래로 계기판 패널이 펼쳐지고, 세 가지를 같은 슬라이딩 스위치로 고름 (제목은 항상 가운데)
 */
const ControlsMenu: React.FC<{ isKorean: boolean; dark: boolean; setDark: (d: boolean) => void }> = ({ isKorean, dark, setDark }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { program, isLoading, toast, choose, options } = useProgramChooser(isKorean);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true }); // 스크롤 시작을 막지 않게
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rows: { label: string; control: React.ReactNode }[] = [
    {
      label: isKorean ? '과정' : 'Program',
      control: (
        <SlideSwitch wide ariaLabel={isKorean ? '학부·대학원 선택' : 'Undergraduate or graduate'} options={options}
          value={program} onChange={choose} disabled={isLoading} />
      ),
    },
    {
      label: isKorean ? '언어' : 'Language',
      control: (
        <SlideSwitch wide ariaLabel={isKorean ? '언어 선택' : 'Language'}
          options={[{ value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }]}
          value={isKorean ? 'ko' : 'en'} onChange={(v) => dispatch(v === 'ko' ? setKorean() : setEnglish())} />
      ),
    },
    {
      label: isKorean ? '화면' : 'Theme',
      control: (
        <SlideSwitch wide ariaLabel={isKorean ? '화면 모드' : 'Theme'}
          options={[{ value: 'light', label: 'Light', icon: <SunSmall /> }, { value: 'dark', label: 'Night', icon: <MoonSmall /> }]}
          value={dark ? 'dark' : 'light'} onChange={(v) => setDark(v === 'dark')} />
      ),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={isKorean ? '설정' : 'Settings'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${actionClass} relative`}
      >
        <SlidersIcon />
        {/* 대학원 모드면 작은 점 — 패널을 열지 않아도 지금 기준을 알 수 있게 */}
        {program === 'graduate' && <span className="absolute -right-[2px] -top-[2px] h-[8px] w-[8px] rounded-full bg-accent-ink ring-2 ring-surface" />}
      </button>
      {open && (
        <div className="hobit-appear absolute right-0 top-[calc(100%+12px)] w-[min(300px,calc(100vw-28px))] rounded-[18px] border border-line bg-surface p-[14px] shadow-lg">
          <div className="flex flex-col gap-[12px]">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-[10px]">
                <span className="text-f-sm font-6semibold text-ink-2">{r.label}</span>
                {r.control}
              </div>
            ))}
          </div>
        </div>
      )}
      {!open && <Toast text={toast} />}
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

  const set = (next: boolean) => {
    apply(next);
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {}
  };
  const toggle = () => set(!dark);
  return { dark, toggle, set };
};

const actionClass =
  'wiggle flex items-center gap-[6px] text-ink-2 hover:text-ink transition-colors text-f-nav font-5medium outline-none focus-visible:ring-2 focus-visible:ring-line rounded-[8px] px-[2px]';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const i18n = isKorean ? lang.ko : lang.en;
  const { dark, toggle, set: setDark } = useTheme();

  // 버튼 라벨은 "누르면 바뀔 상태" (블로그와 같은 방식)
  const langLabel = isKorean ? 'English' : '한국어';
  const themeLabel = dark ? 'Light' : 'Night'; // 테마 라벨은 언어와 관계없이 항상 영어

  return (
    <div className="h-[60px] md:h-[70px] bg-surface fixed top-0 left-0 w-full border-b border-line flex items-center z-50 px-[14px] sm:px-[16px] md:px-[22px] xl:px-[36px]">
      <div className="flex-1 flex justify-start">
        <button
          type="button"
          aria-label={isKorean ? '메뉴' : 'Menu'}
          onClick={() => dispatch(toggleMenu())}
          // 손가락·마우스가 닿는 순간 메뉴 내용 코드를 미리 받기 시작 (누를 때쯤이면 준비됨)
          onPointerEnter={() => preloadMenuContent().catch(() => undefined)}
          onPointerDown={() => preloadMenuContent().catch(() => undefined)}
          className={actionClass.replace('wiggle ', '')} // 메뉴 아이콘은 흔들지 않음
        >
          <MenuIcon />
        </button>
      </div>

      {/* 제목은 항상 화면 정가운데 (양옆 버튼 폭과 상관없이) */}
      <p data-hobit-title className="pointer-events-none absolute left-1/2 -translate-x-1/2 max-w-[calc(100%-150px)] text-center font-7bold text-f-title text-ink whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="lg:hidden">{isKorean ? '정보대학 호빗' : 'hoBIT'}</span>
        <span className="hidden lg:inline">{i18n.headerTitle}</span>
      </p>

      {/* 480px 미만: 설정 아이콘 하나 → 누르면 계기판 패널 */}
      <div className="flex-1 flex justify-end min-[480px]:hidden">
        <ControlsMenu isKorean={isKorean} dark={dark} setDark={setDark} />
      </div>

      {/* 오른쪽 끝은 글자라 아이콘(안쪽 여백 있음)보다 바깥에 붙어 보임 → 조금 더 띄워 좌우 균형 */}
      <nav className="hidden min-[480px]:flex flex-1 justify-end items-center gap-[12px] sm:gap-[14px] md:gap-[16px] xl:gap-[28px] pr-[2px] md:pr-[6px]" aria-label={isKorean ? '설정' : 'Settings'}>
        <ProgramSwitch isKorean={isKorean} />
        <button
          type="button"
          onClick={() => dispatch(isKorean ? setEnglish() : setKorean())}
          aria-label={isKorean ? 'Switch to English' : '한국어로 전환'}
          className={actionClass}
        >
          <TranslateIcon />
          <span className="hidden xl:inline">{langLabel}</span>
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? (isKorean ? '라이트 모드로 전환' : 'Switch to light mode') : isKorean ? '나이트 모드로 전환' : 'Switch to night mode'}
          className={actionClass}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
          <span className="hidden xl:inline">{themeLabel}</span>
        </button>
      </nav>
    </div>
  );
};

export default Header;
