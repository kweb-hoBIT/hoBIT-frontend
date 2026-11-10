import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ProgressStep } from '../../api/questionStream';
import './Loading.css';

/**
 * 답변 기다리는 말풍선
 * - 처음 잠깐(0.6초)은 점 세 개 — 금방 끝나는 답변에서 목록이 번쩍이지 않게
 * - 그 뒤로는 단계 체크 목록: 끝난 단계는 ✓ + 무엇을 했는지(예: 자료 찾기 · 학부 공지사항 3),
 *   지금 하는 단계는 돌아가는 표시 (질문 이해 중 → 자료 찾는 중 → 답변 정리 중)
 */
const PENDING = {
  ko: ['질문 이해하는 중…', '자료 찾는 중…', '답변 정리 중…'],
  en: ['Understanding your question…', 'Searching sources…', 'Writing the answer…'],
};

const Loading: React.FC<{ steps?: ProgressStep[] }> = ({ steps }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [showList, setShowList] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowList(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!steps || !showList) {
    return (
      <div className="bg-card font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] hobit-bubble max-w-[400px] break-words inline-block">
        <div className="dots">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }

  const done = steps;
  const searched = done.some((s) => s.key === 'search');
  const understood = done.some((s) => s.key === 'understand');
  const pending = (isKorean ? PENDING.ko : PENDING.en)[searched ? 2 : understood ? 1 : 0];

  return (
    <div className="bg-card mt-[10px] rounded-[20px] px-[18px] py-[13px] hobit-bubble w-fit max-w-[330px] md:max-w-[400px]" role="status" aria-live="polite">
      <ul className="flex flex-col gap-[7px]">
        {done.map((s) => (
          <li key={s.key} className="hobit-appear flex items-center gap-[8px] text-f-sm">
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#22a55a] text-white" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-[12px] w-[12px]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <span className="font-6semibold text-ink-2">{s.label}</span>
            {s.detail && <span className="min-w-0 truncate text-ink-3">· {s.detail}</span>}
          </li>
        ))}
        <li className="flex items-center gap-[8px] text-f-sm">
          <span className="h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-[2.5px] border-card-3 border-t-accent-ink" aria-hidden="true" />
          <span className="font-6semibold text-ink">{pending}</span>
        </li>
      </ul>
    </div>
  );
};

export default Loading;
