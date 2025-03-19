import { useState } from 'react';
import { useSelector } from 'react-redux';

import HobitProfile from './HobitProfile';
import MainOptions from './MainOptions';
import Response from './Response';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';

const HelloHobit: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  return (
    <div>
      <HobitProfile />
      <MainOptions />
      <Response
        text={
          isKorean
            ? `안녕하세요\n저는 고려대학교 정보대학 챗봇\n호빗(hoBIT)이에요!\n\n정보대학 학부 관련 궁금한 점이 있다면\n언제든지 저에게 질문해주세요`
            : `Hello!\nI'm hoBIT, the chatbot of the College of Informatics at Korea University.\n\nIf you have any questions regarding the undergraduate program in the College of Information, feel free to ask me anytime!`
        }
        faqs={faqs}
      />
    </div>
  );
};

export default HelloHobit;
