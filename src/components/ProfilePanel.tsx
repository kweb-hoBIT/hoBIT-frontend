import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

import { RootState } from '../redux/store';
import { deleteProfile, getProfile, saveProfile, ProfileData, StoredProfile } from '../api/query';
import { appConfirm } from './ui/Dialog';
import { FIELD_OPTIONS, optionConflict, toDisplayValue, toStoredValue } from './chat/ProfileInput';

const FIELDS = ['department', 'admission_year', 'grade', 'major_type', 'student_status'] as const;
type Field = (typeof FIELDS)[number];

/**
 * 메뉴 상단 '내 정보' — 챗봇이 이 세션에 저장한 프로필을 확인·변경·삭제.
 * 메뉴를 열 때만 조회한다 (Redis 읽기 1회).
 */
const ProfilePanel: React.FC = () => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const [expanded, setExpanded] = useState(true);
  const [data, setData] = useState<StoredProfile | null>(null);
  const [editing, setEditing] = useState<Field | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getProfile());
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      setEditing(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const save = (field: Field, stored: string) =>
    run(() => {
      const payload: ProfileData = { language: isKorean ? 'ko' : 'en' };
      if (field === 'grade' || field === 'admission_year') payload[field] = parseInt(stored, 10);
      else payload[field] = stored;
      return saveProfile(payload);
    });

  const profile = data?.profile;
  const hasAny = profile && FIELDS.some((f) => profile[f] !== null && profile[f] !== '');
  const hours = data?.ttl_seconds && data.ttl_seconds > 0 ? Math.ceil(data.ttl_seconds / 3600) : null;

  return (
    <div className="mt-4 mb-2 rounded-[10px] border border-line">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex justify-between items-center px-[16px] py-[10px] text-f-lg font-6semibold text-ink"
      >
        <span>{isKorean ? '내 정보' : 'My Info'}</span>
        {expanded ? <FaChevronUp className="text-ink-3" /> : <FaChevronDown className="text-ink-3" />}
      </button>

      {expanded && (
        <div className="px-[15px] pb-[12px]">
          <p className="text-f-sm text-ink-2 mb-[10px]">
            {isKorean
              ? `대화 중 알려주신 정보로 맞춤 답변을 드려요. 이 기기에서만 쓰이며${hours ? ` 대화가 없으면 약 ${hours}시간 뒤` : ''} 자동으로 지워져요.`
              : `Used only on this device to tailor answers${hours ? `; erased after about ${hours}h of inactivity` : ''}.`}
          </p>

          {FIELDS.map((field) => {
            const meta = FIELD_OPTIONS[field];
            const value = profile?.[field];
            const options = isKorean ? meta.options_ko : meta.options_en;
            return (
              <div key={field} className="py-[6px] border-b border-line last:border-b-0">
                <div className="flex items-center justify-between gap-[8px]">
                  <span className="text-f-base text-ink-2 shrink-0">{isKorean ? meta.label_ko : meta.label_en}</span>
                  <span className={`text-f-base flex-1 text-right ${value ? 'text-ink font-5medium' : 'text-ink-3'}`}>
                    {value ? toDisplayValue(field, value, isKorean) : isKorean ? '미설정' : 'Not set'}
                  </span>
                  <button
                    disabled={busy}
                    onClick={() => setEditing(editing === field ? null : field)}
                    className="text-f-sm text-link hover:underline disabled:opacity-50"
                  >
                    {isKorean ? '변경' : 'Edit'}
                  </button>
                  {value && (
                    <button
                      disabled={busy}
                      onClick={() => run(() => deleteProfile(field))}
                      className="text-f-sm text-accent-ink hover:underline disabled:opacity-50"
                    >
                      {isKorean ? '삭제' : 'Delete'}
                    </button>
                  )}
                </div>
                {editing === field && (
                  <div className="flex flex-wrap gap-[6px] mt-[6px]">
                    {options.map((opt, idx) => {
                      const stored = toStoredValue(field, idx, opt);
                      // 저장된 학과·학번과 맞지 않는 선택지는 비활성화 (예: 데이터과학과면 20·21학번)
                      const conflict = optionConflict(field, stored, { department: profile?.department, admission_year: profile?.admission_year }, isKorean);
                      return (
                        <button
                          key={opt}
                          disabled={busy || Boolean(conflict)}
                          title={conflict ?? undefined}
                          onClick={() => save(field, stored)}
                          className={`px-[12px] py-[4px] rounded-full text-f-sm border ${
                            String(value) === stored
                              ? 'bg-[#686D76] text-white border-ink-2'
                              : conflict
                                ? 'bg-surface text-ink-3 border-line opacity-50 cursor-not-allowed'
                                : 'bg-surface text-ink-2 border-ink-2 hover:bg-card'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {hasAny && (
            <button
              disabled={busy}
              onClick={async () => {
                if (await appConfirm(isKorean ? '저장된 정보와 대화 기록을 모두 지울까요?' : 'Delete all saved info and chat history?', { danger: true })) {
                  run(() => deleteProfile());
                }
              }}
              className="mt-[10px] w-full py-[6px] rounded-[8px] text-f-base text-accent-ink border border-accent-ink hover:bg-senior disabled:opacity-50"
            >
              {isKorean ? '모두 지우기' : 'Delete all'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePanel;
