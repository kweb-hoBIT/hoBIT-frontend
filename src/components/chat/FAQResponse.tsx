import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';

const FAQResponse: React.FC = () => {
  const dispatch = useDispatch();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));

    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div>
      <HobitProfile />
      <Response
        text={
          isKorean
            ? `자주 묻는 질문 카테고리예요!\n궁금한 점이 있으면 추가로 질문해주세요!`
            : `Here are some frequently asked questions!\nFeel free to ask more if you have any other questions.`
        }
        faqs={faqs}
      />
      {isKorean ? (
        <>
          <div className="mt-[10px]">
            <button
              onClick={() => handleSendKeyword('공간예약🏫')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              공간예약🏫
            </button>
            <button
              onClick={() => handleSendKeyword('안전교육⛑️')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              안전교육⛑️
            </button>
            <button
              onClick={() => handleSendKeyword('학위기🎓')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] hover:bg-gray-300"
            >
              학위기🎓
            </button>
          </div>
          <div className="mt-[10px]">
            <button
              onClick={() => handleSendKeyword('졸업요건 확인✔️')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              졸업요건 확인✔️
            </button>
            <button
              onClick={() => handleSendKeyword('교환학생🌎')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] hover:bg-gray-300"
            >
              교환학생🌎
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-[10px]">
            <button
              onClick={() => handleSendKeyword('Space Reservation🏫')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              Space Reservation🏫
            </button>
            <button
              onClick={() => handleSendKeyword('Safety Education⛑️')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              Safety Education⛑️
            </button>
          </div>
          <div className="mt-[10px]">
            <button
              onClick={() => handleSendKeyword('Diploma🎓')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              Diploma🎓
            </button>
            <button
              onClick={() => handleSendKeyword('Graduation Requirements✔️')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-gray-300"
            >
              Graduation Requirements✔️
            </button>
          </div>
          <div className="mt-[10px]">
            <button
              onClick={() => handleSendKeyword('Exchange Student🌎')}
              className="border border-gray-300 font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] hover:bg-gray-300"
            >
              Exchange Student🌎
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FAQResponse;
