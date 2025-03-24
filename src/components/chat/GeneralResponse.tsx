import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import errorImg from '../../assets/error_image.png';

import HobitProfile from './HobitProfile';
import Response from './Response';
import MultipleResponse from './MultipleResponse';
import Survey from './Survey';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';
import Loading from './Loading';

type HobitResponseProps = {
  faqs: Faq[];
  loading: boolean;
};

const GeneralResponse: React.FC<HobitResponseProps> = ({
  faqs: newFaqs,
  loading,
}) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);

  useEffect(() => {
    if (newFaqs) {
      setFaqs(newFaqs);
    }
  }, [newFaqs]);

  if (loading) {
    return (
      <div>
        <HobitProfile />
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <HobitProfile />
      {faqs.length > 1 ? (
        <>
          <img
            src={errorImg}
            alt="error image"
            className="w-[200px] my-[10px] ml-[60px]"
          />
          <MultipleResponse
            text={
              isKorean
                ? `질문을 제대로 이해하지 못했어요🥲\n혹시 다음 질문을 찾으시나요?`
                : `I'm having trouble understanding your question..🥲\nIs these what you’re looking for?`
            }
            faqs={faqs}
          />
        </>
      ) : (
        <>
          <Response text="" faqs={faqs} />
          {faqs.length > 0 && (
            <Survey id={faqs[0].id} user_question={sentValue} />
          )}
        </>
      )}
    </div>
  );
};

export default GeneralResponse;
