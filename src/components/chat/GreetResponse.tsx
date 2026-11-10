import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { MascotOnce } from './Mascot';
import { Faq } from '../../types/faq';
import { clearSentValue, sendInputValue } from '../../redux/inputSlice';

const GreetResponse: React.FC = () => {
  const dispatch = useDispatch();
  const [mocks, _setMocks] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const helloImg = useSelector(
    (state: RootState) => state.image.images['helloImage']
  );

  const handleSendOption = (message: string) => {
    dispatch(sendInputValue(message));
    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div>
      <HobitProfile />
      <div className="bg-card w-[300px] max-w-full md:max-w-none md:w-[350px] h-auto mt-[12px] md:mt-[20px] rounded-[16px] md:rounded-[20px] flex flex-col items-center px-[14px] pt-[10px] pb-[6px] md:p-[20px]">
        {/* 인사 응답 — 손 흔드는 호빗(hi) 한 번 (받기 전·동작 줄이기·관리자가 끄면 hello.png) */}
        <MascotOnce clip="hi" poster={helloImg} alt="hello image" className="w-[124px] md:w-[200px] h-auto aspect-square mb-[2px] md:mb-[10px]" />
        <div className="flex w-full justify-between items-center">
          <button
            onClick={() =>
              handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQ')
            }
            className="w-full text-ink-2 font-6semibold text-f-base py-[4px] md:py-[5px] hover:text-ink"
          >
            {isKorean ? '자주 묻는 질문' : 'FAQ'}
          </button>
          <span className="text-f-lg text-ink-3 font-1thin">|</span>
          <button
            onClick={() =>
              handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
            }
            className="w-full text-ink-2 font-6semibold text-f-base py-[4px] md:py-[5px] hover:text-ink"
          >
            {isKorean ? '할 수 있는 일' : 'What I Can Do'}
          </button>
        </div>
      </div>
      <Response
        text={
          isKorean
            ? 
`안녕하세요!
저는 정보대학 챗봇 호빗(hoBIT)이에요 ☺️`
            : 
`Hello!
I’m hoBIT, the chatbot for the College of Informatics ☺️`
        }
        faqs={mocks}
      />
    </div>
  );
};

export default GreetResponse;
