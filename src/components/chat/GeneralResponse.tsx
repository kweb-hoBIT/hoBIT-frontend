import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import HobitProfile from './HobitProfile';
import Response from './Response';
import MultipleResponse from './MultipleResponse';
import Survey from './Survey';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';

type HobitResponseProps = {
  faqs: Faq[];
};

const GeneralResponse: React.FC<HobitResponseProps> = ({ faqs: newFaqs }) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  useEffect(() => {
    if (newFaqs) {
      setFaqs(newFaqs);
    }
  }, [newFaqs]);

  return (
    <div>
      <HobitProfile />
      {faqs.length > 1 ? (
        <MultipleResponse
          text={
            isKorean
              ? `질문을 제대로 이해하지 못했어요🥲\n혹시 다음 질문을 찾으시나요?`
              : `I'm having trouble understanding your question..🥲\nIs these what you’re looking for?`
          }
          faqs={faqs}
        />
      ) : (
        <>
          <Response text="" faqs={faqs} />
          {faqs.length > 0 && <Survey id={faqs[0].id} />}
        </>
      )}
    </div>
  );
};

export default GeneralResponse;
