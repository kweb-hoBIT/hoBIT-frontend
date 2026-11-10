import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ProgressStep } from '../../api/questionStream';
import './Loading.css';

/**
 * 답변 기다리는 말풍선
 * - steps가 없으면 점 세 개 (FAQ 바로 조회처럼 단계가 없는 경우, 또는 질문 직후 0.3초)
 * - steps가 있으면 단계 체크 목록: 끝난 단계는 ✓ + 무엇을 했는지(예: 자료 찾기 · 학부 공지사항 3),
 *   지금 하는 단계는 돌아가는 표시 (질문 이해 중 → 자료 찾는 중 → 답변 정리 중)
 *   단계가 보이는 박자는 Chatting(pacer)이 정함 — 한꺼번에 와도 하나씩 ✓
 * - written: 글이 나오기 시작함 → 마지막 줄도 ✓ '답변 정리'
 * - collapsed: 답변을 읽는 데 방해되지 않게 한 줄 요약으로 접음 (누르면 다시 펼침)
 */
const PENDING = {
  ko: ['질문 이해하는 중…', '자료 찾는 중…', '답변 정리 중…'],
  en: ['Understanding your question…', 'Searching sources…', 'Writing the answer…'],
};
const WRITTEN = { ko: '답변 정리', en: 'Answer written' };

const Check: React.FC<{ small?: boolean }> = ({ small }) => (
  <span
    className={`flex ${small ? 'h-[14px] w-[14px]' : 'h-[18px] w-[18px]'} shrink-0 items-center justify-center rounded-full bg-[#22a55a] text-white`}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" className={small ? 'h-[9px] w-[9px]' : 'h-[12px] w-[12px]'} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  </span>
);

const Loading: React.FC<{ steps?: ProgressStep[]; written?: boolean; collapsed?: boolean }> = ({ steps, written, collapsed }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [open, setOpen] = useState(false); // 접힌 요약을 눌러 다시 펼침

  if (!steps) {
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
  const writtenLabel = isKorean ? WRITTEN.ko : WRITTEN.en;
  const folded = Boolean(collapsed) && !open;
  // 단계 없이 바로 글이 나온 답변은 접을 때 아무것도 남기지 않음
  const showSummary = Boolean(collapsed) && done.length > 0;
  const count = done.length + (written ? 1 : 0);

  return (
    <div>
      {/* 접힐 때 높이가 툭 줄지 않게 grid 행 높이를 서서히 (움직임 줄이기 설정이면 바로) */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${folded ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}
        aria-hidden={folded}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-card mt-[10px] rounded-[20px] px-[18px] py-[13px] hobit-bubble w-fit max-w-[330px] md:max-w-[400px]" role="status" aria-live="polite">
            <ul className="flex flex-col gap-[7px]">
              {done.map((s) => (
                <li key={s.key} className="hobit-appear flex items-center gap-[8px] text-f-sm">
                  <Check />
                  <span className="shrink-0 whitespace-nowrap font-6semibold text-ink-2">{s.label}</span>
                  {s.detail && <span className="min-w-0 truncate text-ink-3">· {s.detail}</span>}
                </li>
              ))}
              {written ? (
                <li className="hobit-appear flex items-center gap-[8px] text-f-sm">
                  <Check />
                  <span className="shrink-0 whitespace-nowrap font-6semibold text-ink-2">{writtenLabel}</span>
                </li>
              ) : (
                <li className="flex items-center gap-[8px] text-f-sm">
                  <span className="h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-[2.5px] border-card-3 border-t-accent-ink" aria-hidden="true" />
                  <span className="whitespace-nowrap font-6semibold text-ink">{pending}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {showSummary && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="hobit-appear mt-[8px] flex max-w-[330px] md:max-w-[400px] items-center gap-[6px] text-left text-f-caption text-ink-3 hover:text-ink-2"
        >
          <Check small />
          <span className="shrink-0 font-6semibold">{isKorean ? `${count}단계 완료` : `${count} steps done`}</span>
          <span className="min-w-0 truncate">
            {open
              ? `· ${isKorean ? '접기' : 'Hide'}`
              : `· ${[...done.map((s) => s.label), ...(written ? [writtenLabel] : [])].join(' · ')}`}
          </span>
        </button>
      )}
    </div>
  );
};

export default Loading;
