import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';
import { getFAQs } from '../../api/query';

const FAQResponse: React.FC = () => {
  const dispatch = useDispatch();
  const [mocks, _setMocks] = useState<Faq[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const fetchedFaqs = await getFAQs();
        setFaqs(fetchedFaqs.faqs);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <div>
      <HobitProfile />
      <Response
        text={
          isKorean
            ? `최근 한 달간 자주 묻는 질문들이에요!\n궁금한 점이 있으면 추가로 질문해주세요`
            : `Here are some frequently asked questions for the past month!\nFeel free to ask more if you have any other questions.`
        }
        faqs={mocks}
      />
      <div className="flex flex-col w-full">
        {faqs.map((faq, index) => (
          <div
            key={index}
            onClick={() =>
              handleSendKeyword(isKorean ? faq.question_ko : faq.question_en)
            }
            className="faq-item border border-gray-300 font-5medium text-lg md:text-xl w-fit md:w-fit md:max-w-none mt-[10px] rounded-[20px] px-[20px] py-[15px] break-words inline-block
              hover:bg-gray-100 transition-colors cursor-pointer md:mr-[10px]"
          >
            <h3>{isKorean ? faq.question_ko : faq.question_en}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQResponse;
