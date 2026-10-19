import React, { useEffect, useLayoutEffect } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { TbSend2 } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';

import {
  sendInputValue,
  setIsEmpty,
  updateLiveValue,
} from '../redux/inputSlice';
import { setHomeClicked } from '../redux/homeSlice';
import { RootState } from '../redux/store';

const Input: React.FC = () => {
  const dispatch = useDispatch();
  const liveValue = useSelector((state: RootState) => state.input.liveValue);
  const isLoading = useSelector((state: RootState) => state.input.isLoading);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [isSending, setIsSending] = React.useState(false);

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
    if (liveValue.trim() !== '' && !isSending && !isLoading) {
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
        <AiFillHome
          className="text-f-display text-accent-ink mr-[15px] md:mr-[20px] mb-[6px] md:mb-[8px] shrink-0 hover:text-ink-2 cursor-pointer"
          onClick={handleHomeClick}
        />
        <div className={`w-full min-h-[40px] md:min-h-[48px] px-4 py-[8px] md:py-[10px] rounded-[24px] flex flex-row items-end transition-colors ${isLoading ? 'bg-card' : 'bg-card-2'}`}>
          <textarea
            rows={1}
            ref={inputRef}
            placeholder={
              isLoading
                ? (isKorean ? '답변 생성 중...' : 'Generating response...')
                : (isKorean ? '호빗에게 물어보세요!' : 'Ask Anything to hoBIT!')
            }
            value={liveValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="bg-transparent w-full outline-none resize-none leading-[24px] md:leading-[28px] placeholder-ink-3 font-6semibold text-f-base-xl disabled:cursor-not-allowed"
          />
          <TbSend2
            onClick={handleSend}
            className={`ml-[10px] mb-[2px] shrink-0 text-f-xl transition-colors ${isLoading ? 'text-ink-3/50 cursor-not-allowed' : 'text-ink-3 hover:text-ink cursor-pointer'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Input;
