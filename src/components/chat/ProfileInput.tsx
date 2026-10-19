import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';
import HobitProfile from './HobitProfile';
import { getProfile, saveProfile, ProfileData } from '../../api/query';

export const FIELD_OPTIONS: Record<string, { label_ko: string; label_en: string; options_ko: string[]; options_en: string[] }> = {
  department: {
    label_ko: '학과',
    label_en: 'Department',
    options_ko: ['컴퓨터학과', '데이터과학과', '인공지능학과'],
    options_en: ['Computer Science', 'Data Science', 'Artificial Intelligence'],
  },
  major_type: {
    label_ko: '전공 유형',
    label_en: 'Major Type',
    options_ko: ['심화전공', '이중전공', '복수전공', '부전공'],
    options_en: ['Intensive Major', 'Double Major', 'Multiple Major', 'Minor'],
  },
  grade: {
    label_ko: '학년',
    label_en: 'Grade',
    options_ko: ['1학년', '2학년', '3학년', '4학년'],
    options_en: ['1st year', '2nd year', '3rd year', '4th year'],
  },
  admission_year: {
    label_ko: '학번',
    label_en: 'Admission Year',
    options_ko: ['20학번', '21학번', '22학번', '23학번', '24학번', '25학번', '26학번'],
    // 'Class of 2020'은 영어로 2020년 졸업생이라는 뜻이라 학번(입학 연도)과 반대 — 입학 연도로 표기
    options_en: ['Admitted 2020', 'Admitted 2021', 'Admitted 2022', 'Admitted 2023', 'Admitted 2024', 'Admitted 2025', 'Admitted 2026'],
  },
  student_status: {
    label_ko: '학적 상태',
    label_en: 'Student Status',
    options_ko: ['재학', '편입', '휴학', '수료'],
    options_en: ['Enrolled', 'Transfer', 'Leave of Absence', 'Completed'],
  },
};

/**
 * 선택지 → 저장값 (학년은 1~4, 학번은 20~26, 나머지는 한국어 표준값).
 * 영어 모드에서 골라도 한국어로 저장 — 검색 필터·문서 태그가 한국어 값 기준이라
 * (예전엔 "Multiple Major", "Transfer"처럼 영어로 저장돼 필터가 맞지 않을 수 있었음)
 */
export const toStoredValue = (field: string, index: number, option: string): string =>
  field === 'grade' ? String(index + 1)
    : field === 'admission_year' ? String(20 + index)
      : FIELD_OPTIONS[field]?.options_ko[index] ?? option;

/** 저장값 → 화면 표시 */
export const toDisplayValue = (field: string, value: string | number, isKorean: boolean): string => {
  if (field === 'grade') return isKorean ? `${value}학년` : `Year ${value}`;
  if (field === 'admission_year') return isKorean ? `${value}학번` : `Admitted 20${value}`;
  // 학과·전공 유형·학적 상태: 저장값(한국어, 예전 영어 저장값도 허용)을 화면 언어로
  const meta = FIELD_OPTIONS[field];
  if (meta) {
    const v = String(value).trim().toLowerCase();
    const idx = [meta.options_ko, meta.options_en].map((list) => list.findIndex((o) => o.toLowerCase() === v)).find((i) => i >= 0);
    if (idx !== undefined) return isKorean ? meta.options_ko[idx] : meta.options_en[idx];
  }
  return String(value);
};

/**
 * 학과별 첫 입학 학번 — 이보다 앞선 학번은 없는 조합이라 선택지에서 비활성화
 * (RAG main.py DEPARTMENT_FOUNDED와 같은 값으로 유지)
 */
export const DEPARTMENT_FIRST_COHORT: Record<string, number> = { 데이터과학과: 22, 인공지능학과: 25 };

/** 저장값(한국어·예전 영어 값 모두)을 한국어 표준값으로 */
const toKo = (field: string, value?: string | number | null): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const meta = FIELD_OPTIONS[field];
  const v = String(value).trim().toLowerCase();
  const idx = meta ? meta.options_en.findIndex((o) => o.toLowerCase() === v) : -1;
  return idx >= 0 ? meta.options_ko[idx] : String(value);
};

/**
 * 선택지가 지금 고른(또는 저장된) 학과·학번과 맞지 않는지 — 맞지 않으면 사유를, 맞으면 null
 *  학번 선택지: 학과 신설 전 학번이면 비활성화 / 학과 선택지: 고른 학번에 없던 학과면 비활성화
 */
export const optionConflict = (
  field: string,
  storedValue: string,
  context: { department?: string | number | null; admission_year?: string | number | null },
  isKorean: boolean
): string | null => {
  const dept = toKo('department', context.department);
  if (field === 'admission_year' && dept && DEPARTMENT_FIRST_COHORT[dept] && Number(storedValue) < DEPARTMENT_FIRST_COHORT[dept]) {
    return isKorean ? `${dept}는 ${DEPARTMENT_FIRST_COHORT[dept]}학번부터예요` : `${dept} starts from ${2000 + DEPARTMENT_FIRST_COHORT[dept]} admissions`;
  }
  const year = context.admission_year ? Number(context.admission_year) : null;
  const first = DEPARTMENT_FIRST_COHORT[toKo('department', storedValue) ?? ''];
  if (field === 'department' && year && first && year < first) {
    return isKorean ? `${toKo('department', storedValue)}는 ${first}학번부터예요` : `Admissions start from ${2000 + first}`;
  }
  return null;
};

interface ProfileInputProps {
  missingFields: string[];
  onSaved: () => void;
  // blocking: 답변 전에 꼭 필요한 정보 (호빗 프로필과 함께 단독 표시)
  // followup: 답변 아래에 붙는 추가 정보 요청 — 입력하면 내 상황에 맞춰 다시 답변
  variant?: 'blocking' | 'followup';
}

const ProfileInput: React.FC<ProfileInputProps> = ({ missingFields, onSaved, variant = 'blocking' }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // 이미 저장된 학과·학번 (묻지 않는 항목) — 선택지 비활성화 판단에 사용
  const [stored, setStored] = useState<{ department?: string | number | null; admission_year?: string | number | null }>({});
  useEffect(() => {
    getProfile().then((d) => setStored({ department: d?.profile?.department, admission_year: d?.profile?.admission_year })).catch(() => {});
  }, []);
  const context = {
    department: selections.department ?? stored.department,
    admission_year: selections.admission_year ?? stored.admission_year,
  };

  const allSelected = missingFields.every((f) => selections[f]);

  const handleSelect = (field: string, value: string) => {
    setSelections((prev) => {
      const next = { ...prev, [field]: value };
      // 새로 고른 학과와 맞지 않는 학번(또는 그 반대)은 선택 해제
      const other = field === 'department' ? 'admission_year' : field === 'admission_year' ? 'department' : null;
      if (other && next[other] && optionConflict(other, next[other], { ...next }, true)) delete next[other];
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!allSelected || saving) return;
    setSaving(true);
    try {
      const profileData: ProfileData = { language: isKorean ? 'ko' : 'en' };
      if (selections.department) profileData.department = selections.department;
      if (selections.major_type) profileData.major_type = selections.major_type;
      if (selections.grade) profileData.grade = parseInt(selections.grade);
      if (selections.admission_year) profileData.admission_year = parseInt(selections.admission_year);
      if (selections.student_status) profileData.student_status = selections.student_status;
      await saveProfile(profileData);
      onSaved();
    } catch (err) {
      console.error('프로필 저장 실패:', err);
      setSaving(false);
    }
  };

  return (
    <div>
      {variant === 'blocking' && <HobitProfile />}
      <div className={`bg-card w-full max-w-[330px] md:max-w-none md:w-[350px] h-auto ${variant === 'blocking' ? 'mt-[20px]' : 'mt-[10px]'} rounded-[20px] p-[20px]`}>
        <p className="text-ink-2 font-6semibold text-f-sm mb-[12px]">
          {variant === 'blocking'
            ? isKorean
              ? '정확한 답변을 위해 아래 정보를 알려주세요.'
              : 'Please provide the following information for a more accurate answer.'
            : isKorean
              ? '아래 정보를 알려주시면 내 상황에 해당하는지 다시 확인해 드릴게요.'
              : 'Tell us a bit more and we will check whether this applies to you.'}
        </p>

        {missingFields.map((field) => {
          const meta = FIELD_OPTIONS[field];
          if (!meta) return null;
          const label = isKorean ? meta.label_ko : meta.label_en;
          const options = isKorean ? meta.options_ko : meta.options_en;

          return (
            <div key={field} className="mb-[10px]">
              <p className="text-ink-2 text-f-xs mb-[6px]">{label}</p>
              <div className="flex flex-wrap gap-[6px]">
                {options.map((opt) => {
                  const idx = options.indexOf(opt);
                  const storedValue = toStoredValue(field, idx, opt);
                  const isSelected = selections[field] === storedValue;
                  const conflict = optionConflict(field, storedValue, context, isKorean);
                  return (
                    <button
                      key={opt}
                      disabled={Boolean(conflict)}
                      title={conflict ?? undefined}
                      onClick={() => handleSelect(field, storedValue)}
                      className={`px-[10px] py-[4px] rounded-full text-f-xs border transition-colors ${
                        isSelected
                          ? 'bg-[#686D76] text-white border-ink-2'
                          : conflict
                            ? 'bg-surface text-ink-3 border-line opacity-50 cursor-not-allowed'
                            : 'bg-surface text-ink-2 border-ink-2 hover:bg-card-2'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleConfirm}
          disabled={!allSelected || saving}
          className={`mt-[14px] w-full py-[8px] rounded-[10px] text-f-sm font-6semibold transition-colors ${
            allSelected && !saving
              ? 'bg-[#686D76] text-white hover:bg-[#454952]'
              : 'bg-card-3 text-ink-3 cursor-not-allowed'
          }`}
        >
          {saving
            ? isKorean ? '저장 중...' : 'Saving...'
            : variant === 'followup'
              ? isKorean ? '내 상황에 맞춰 다시 답변 받기' : 'Get an answer for my case'
              : isKorean ? '확인' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export default ProfileInput;
