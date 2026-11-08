import { useEffect, useSyncExternalStore } from 'react';

import { getProfileOptions, ProfileOptionsResponse } from '../../api/query';

/**
 * 프로필 선택지 — 학과·전공 유형·학적 상태는 관리자 사이트 '프로필 항목'에서 관리 (서버 GET /profile_options),
 * 학년은 1~4 고정, 학번은 올해 기준 자동 (서버가 계산).
 * 서버에서 받기 전·실패 시에는 아래 기본값으로 동작한다.
 */
export type FieldMeta = {
  label_ko: string;
  label_en: string;
  values: string[]; // 저장값 (학과 등은 한국어 공식 이름, 학년 1~4, 학번 2자리)
  options_ko: string[];
  options_en: string[];
};

const yearMeta = (years: number[]): Pick<FieldMeta, 'values' | 'options_ko' | 'options_en'> => ({
  values: years.map(String),
  options_ko: years.map((y) => `${y}학번`),
  // 'Class of 2020'은 영어로 2020년 졸업생이라는 뜻이라 학번(입학 연도)과 반대 — 입학 연도로 표기
  options_en: years.map((y) => `Admitted ${2000 + y}`),
});

const thisYear = new Date().getFullYear() % 100;

export const FIELD_OPTIONS: Record<string, FieldMeta> = {
  department: {
    label_ko: '학과',
    label_en: 'Department',
    values: ['컴퓨터학과', '데이터과학과', '인공지능학과'],
    options_ko: ['컴퓨터학과', '데이터과학과', '인공지능학과'],
    options_en: ['Computer Science', 'Data Science', 'Artificial Intelligence'],
  },
  major_type: {
    label_ko: '전공 유형',
    label_en: 'Major Type',
    values: ['심화전공', '이중전공', '복수전공', '부전공'],
    options_ko: ['심화전공', '이중전공', '복수전공', '부전공'],
    options_en: ['Intensive Major', 'Double Major', 'Multiple Major', 'Minor'],
  },
  grade: {
    label_ko: '학년',
    label_en: 'Grade',
    values: ['1', '2', '3', '4'],
    options_ko: ['1학년', '2학년', '3학년', '4학년'],
    options_en: ['1st year', '2nd year', '3rd year', '4th year'],
  },
  admission_year: {
    label_ko: '학번',
    label_en: 'Admission Year',
    ...yearMeta(Array.from({ length: 7 }, (_, i) => thisYear - 6 + i)),
  },
  // 대학원 — '내 정보'에서 학부/대학원 스위치가 대학원일 때 보이는 항목 (학부 정보와 따로 저장)
  grad_department: {
    label_ko: '대학원 학과',
    label_en: 'Graduate Dept.',
    values: ['컴퓨터학과', '인공지능학과', '뇌공학과', '영상정보처리협동과정'],
    options_ko: ['컴퓨터학과', '인공지능학과', '뇌공학과', '영상정보처리협동과정'],
    options_en: ['Computer Science', 'Artificial Intelligence', 'Brain and Cognitive Eng.', 'Visual Information Processing'],
  },
  degree: {
    label_ko: '과정',
    label_en: 'Program',
    values: ['석사', '박사', '석박사통합'],
    options_ko: ['석사', '박사', '석박사통합'],
    options_en: ["Master's", 'Ph.D.', 'Integrated M.S./Ph.D.'],
  },
  grad_admission_year: {
    label_ko: '입학 연도',
    label_en: 'Entry Year',
    values: Array.from({ length: 7 }, (_, i) => String(2000 + thisYear - 6 + i)),
    options_ko: Array.from({ length: 7 }, (_, i) => `${2000 + thisYear - 6 + i}년`),
    options_en: Array.from({ length: 7 }, (_, i) => String(2000 + thisYear - 6 + i)),
  },
  student_status: {
    label_ko: '학적 상태',
    label_en: 'Student Status',
    values: ['재학', '편입', '휴학', '수료'],
    options_ko: ['재학', '편입', '휴학', '수료'],
    options_en: ['Enrolled', 'Transfer', 'Leave of Absence', 'Completed'],
  },
};

/** 학과별 첫 입학 학번(2자리) — 이보다 앞선 학번은 없는 조합이라 선택지에서 비활성화 */
export const DEPARTMENT_FIRST_COHORT: Record<string, number> = { 데이터과학과: 22, 인공지능학과: 25 };

let version = 0;
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function apply(data: ProfileOptionsResponse) {
  (['department', 'major_type', 'student_status', 'grad_department'] as const).forEach((field) => {
    const items = data[field];
    if (!Array.isArray(items) || !items.length) return;
    Object.assign(FIELD_OPTIONS[field], {
      values: items.map((i) => i.value),
      options_ko: items.map((i) => i.value),
      options_en: items.map((i) => i.label_en || i.value),
    });
  });
  if (Array.isArray(data.grad_admission_year) && data.grad_admission_year.length) {
    Object.assign(FIELD_OPTIONS.grad_admission_year, {
      values: data.grad_admission_year.map(String),
      options_ko: data.grad_admission_year.map((y) => `${y}년`),
      options_en: data.grad_admission_year.map(String),
    });
  }
  if (Array.isArray(data.admission_year) && data.admission_year.length) {
    Object.assign(FIELD_OPTIONS.admission_year, yearMeta(data.admission_year));
  }
  if (Array.isArray(data.department)) {
    Object.keys(DEPARTMENT_FIRST_COHORT).forEach((k) => delete DEPARTMENT_FIRST_COHORT[k]);
    data.department.forEach((d) => {
      if (d.first_cohort) DEPARTMENT_FIRST_COHORT[d.value] = d.first_cohort % 100;
    });
  }
  version += 1;
  listeners.forEach((l) => l());
}

/** 페이지당 한 번 받음 (실패하면 기본값 유지, 다음에 다시 시도) */
export function loadProfileOptions(): Promise<void> {
  if (!loading) {
    loading = getProfileOptions()
      .then(apply)
      .catch(() => {
        loading = null;
      });
  }
  return loading;
}

/** 선택지를 그리는 화면에서 호출 — 서버 값을 받으면 다시 그림 */
export function useProfileOptions(): number {
  useEffect(() => {
    loadProfileOptions();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version
  );
}
