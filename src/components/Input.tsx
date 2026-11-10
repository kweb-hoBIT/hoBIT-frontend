import React, { useEffect, useLayoutEffect } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { TbPlayerStopFilled, TbSend2 } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';

import {
  requestStop,
  sendInputValue,
  setIsEmpty,
  updateLiveValue,
} from '../redux/inputSlice';
import { setHomeClicked } from '../redux/homeSlice';
import { setSuspendedUntil } from '../redux/moderationSlice';
import { RootState } from '../redux/store';
import { formatCountdown } from '../lib/moderation';

// 서버의 질문 길이 제한과 같게 (이보다 길면 서버가 답하지 않음)
const MAX_QUESTION_CHARS = 2000;

const Input: React.FC = () => {
  const dispatch = useDispatch();
  const liveValue = useSelector((state: RootState) => state.input.liveValue);
  const isLoading = useSelector((state: RootState) => state.input.isLoading);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [isSending, setIsSending] = React.useState(false);

  // 질문 일시 정지 — 풀릴 때까지 입력창을 잠그고 남은 시간을 1초마다 보여줌 (실제 차단은 서버)
  const suspendedUntil = useSelector((state: RootState) => state.moderation.suspendedUntil);
  const [now, setNow] = React.useState(() => Date.now());
  const suspended = suspendedUntil > now;
  useEffect(() => {
    if (!suspendedUntil) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= suspendedUntil) {
        window.clearInterval(timer);
        dispatch(setSuspendedUntil(0));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [suspendedUntil, dispatch]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [liveValue]);

  // 줄 수에 맞춰 입력창 높이 조절 (최대 4줄, 넘으면 내부 스크롤).
  // 늘어난 만큼 --input-extra로 알려 대화 영역 아래 여백도 같이 늘림 (마지막 메시지가 가려지지 않게)
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 24;
    ta.style.height = `${Math.min(ta.scrollHeight, lineHeight * 4)}px`;
    const extra = Math.max(0, ta.offsetHeight - lineHeight);
    document.documentElement.style.setProperty('--input-extra', `${extra}px`);
  }, [liveValue]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;

    dispatch(updateLiveValue(value));
    dispatch(setIsEmpty(value === ''));
  };

  const handleSend = () => {
    if (liveValue.trim() !== '' && !isSending && !isLoading && !suspended) {
      setIsSending(true);
      dispatch(sendInputValue(liveValue));
      dispatch(updateLiveValue(''));
      dispatch(setIsEmpty(true));

      setTimeout(() => setIsSending(false), 500);
    }
  };

  // Enter = 보내기, Shift+Enter = 줄바꿈 (한글 조합 중 Enter는 무시)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleHomeClick = () => {
    dispatch(setHomeClicked());
  };

  return (
    <div className="bg-surface border-t-2 fixed bottom-0 left-0 z-50 w-full py-[10px] md:py-[16px] px-[15px] md:px-[20px]">
      <div className="flex items-end w-full">
        {/* 입력칸 한 줄 높이(40/48px)의 칸 안에서 가운데 — 글자 크기 배율에 따라 아이콘 높이가 달라 아래 여백만으로는 어긋났음.
            여러 줄로 늘어나도 아래쪽(첫 줄) 높이에 맞춰 있음 */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label={isKorean ? '처음 화면' : 'Home'}
          className="mr-[15px] md:mr-[20px] flex h-[40px] md:h-[48px] shrink-0 items-center text-accent-ink hover:text-ink-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-line rounded-full"
        >
          <AiFillHome className="text-f-display" aria-hidden="true" />
        </button>
        <div className={`w-full min-h-[40px] md:min-h-[48px] px-4 py-[8px] md:py-[10px] rounded-[24px] flex flex-row items-end transition-colors ${isLoading || suspended ? 'bg-card' : 'bg-card-2'}`}>
          <textarea
            rows={1}
            ref={inputRef}
            placeholder={
              suspended
                ? (isKorean
                    ? `잠시 이용이 제한됐어요 · ${formatCountdown(suspendedUntil - now)} 후 다시 질문할 수 있어요`
                    : `Temporarily suspended · You can ask again in ${formatCountdown(suspendedUntil - now)}`)
                : isLoading
                  ? (isKorean ? '답변 생성 중...' : 'Generating response...')
                  : (isKorean ? '호빗에게 물어보세요!' : 'Ask Anything to hoBIT!')
            }
            value={liveValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_QUESTION_CHARS}
            disabled={isLoading || suspended}
            className="bg-transparent w-full outline-none resize-none leading-[24px] md:leading-[28px] placeholder-ink-3 font-6semibold text-f-base-xl disabled:cursor-not-allowed"
          />
          {/* 보내기·중지 버튼 하나 — 평소엔 화살표, 답변 중에는 ■ (같은 자리·크기라 누르던 손가락 그대로 멈출 수 있게) */}
          <button
            type="button"
            onClick={isLoading ? () => dispatch(requestStop()) : handleSend}
            disabled={suspended && !isLoading}
            aria-label={isLoading ? (isKorean ? '답변 중지' : 'Stop') : isKorean ? '보내기' : 'Send'}
            title={isLoading ? (isKorean ? '답변 중지' : 'Stop') : isKorean ? '보내기' : 'Send'}
            className="ml-[10px] flex h-[24px] md:h-[28px] items-center shrink-0 text-f-xl text-ink-3 hover:text-ink transition-colors cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-line disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? <TbPlayerStopFilled aria-hidden="true" /> : <TbSend2 aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Input;
