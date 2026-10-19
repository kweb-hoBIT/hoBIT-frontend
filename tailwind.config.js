/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // html.dark 클래스로 나이트 모드 (저장값 > 시스템 설정, public/index.html에서 렌더 전 적용)
  darkMode: 'class',
  theme: {
    extend: {
      // --fs-scale: 위젯 창 안에서는 0.875 (index.css html.embed)
      // 유동 글자 크기 — 화면 폭 360px~1280px 사이에서 연속으로 커짐 (CSS clamp).
      // 예전엔 768px 기준 두 단계(text-base md:text-lg)로만 바뀌었음
      fontSize: {
        'f-xs': ['calc(var(--fs-scale, 1) * clamp(12px, calc(11.22px + 0.217vw), 14px))', { lineHeight: '1.4' }],
        'f-caption': ['calc(var(--fs-scale, 1) * clamp(13px, calc(12.22px + 0.217vw), 15px))', { lineHeight: '1.45' }],
        'f-sm': ['calc(var(--fs-scale, 1) * clamp(14px, calc(13.22px + 0.217vw), 16px))', { lineHeight: '1.45' }],
        'f-chip': ['calc(var(--fs-scale, 1) * clamp(14px, calc(12.83px + 0.326vw), 17px))', { lineHeight: '1.35' }],
        'f-nav': ['calc(var(--fs-scale, 1) * clamp(15px, calc(13.83px + 0.326vw), 18px))', { lineHeight: '1.4' }],
        'f-base': ['calc(var(--fs-scale, 1) * clamp(16px, calc(15.22px + 0.217vw), 18px))', { lineHeight: '1.6' }],
        // 메뉴 카테고리 — 폰 16px → 큰 화면 22px (화면이 클수록 확실히 커지게)
        'f-menu': ['calc(var(--fs-scale, 1) * clamp(16px, calc(13.65px + 0.652vw), 22px))', { lineHeight: '1.5' }],
        'f-base-xl': ['calc(var(--fs-scale, 1) * clamp(16px, calc(14.43px + 0.435vw), 20px))', { lineHeight: '1.55' }],
        'f-lg': ['calc(var(--fs-scale, 1) * clamp(18px, calc(17.22px + 0.217vw), 20px))', { lineHeight: '1.5' }],
        'f-xl': ['calc(var(--fs-scale, 1) * clamp(20px, calc(18.43px + 0.435vw), 24px))', { lineHeight: '1.4' }],
        'f-title': ['calc(var(--fs-scale, 1) * clamp(18px, calc(14.87px + 0.870vw), 26px))', { lineHeight: '1.3' }],
        'f-display': ['calc(var(--fs-scale, 1) * clamp(28px, calc(26.43px + 0.435vw), 32px))', { lineHeight: '1.2' }],
      },
      // 의미별 색 — 라이트/나이트 값은 src/index.css의 :root / html.dark 변수
      colors: {
        page: token('page'),            // 화면 배경
        surface: token('surface'),      // 상단·입력 바, 칩, 카드 안 버튼
        card: token('card'),            // 말풍선·카드
        'card-2': token('card-2'),      // 입력칸, 눌림
        'card-3': token('card-3'),      // 더 진한 회색 (토글 바탕 등)
        senior: token('senior'),        // 선배 답변 카드
        'senior-2': token('senior-2'),  // 선배 카드 hover
        ink: token('ink'),              // 본문 글자
        'ink-2': token('ink-2'),        // 보조 글자 (#686D76)
        'ink-3': token('ink-3'),        // 흐린 글자·아이콘
        link: token('link'),
        line: token('line'),            // 테두리·구분선
        accent: token('accent'),        // 호빗 색 (#750E21) — 버튼 배경
        'accent-ink': token('accent-ink'), // 호빗 색 글자·홈 버튼 (나이트에서는 밝게)
        'on-accent-ink': token('on-accent-ink'), // accent-ink 배경 위 글자 (내 채팅 말풍선)
      },
      // 색을 지정하지 않은 테두리(border, border-t-2 등)도 테마를 따름
      borderColor: { DEFAULT: token('line') },
      fontFamily: {
        '9black': ['Freesentation-9Black', 'sans-serif'],
        '8extrabold': ['Freesentation-8ExtraBold', 'sans-serif'],
        '7bold': ['Freesentation-7Bold', 'sans-serif'],
        '6semibold': ['Freesentation-6SemiBold', 'sans-serif'],
        '5medium': ['Freesentation-5Medium', 'sans-serif'],
        '4regular': ['Freesentation-4Regular', 'sans-serif'],
        '3light': ['Freesentation-3Light', 'sans-serif'],
        '2extralight': ['Freesentation-2ExtraLight', 'sans-serif'],
        '1thin': ['Freesentation-1Thin', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
