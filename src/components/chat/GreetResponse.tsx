import { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';

const GreetResponse: React.FC = () => {
  const [mocks, _setMocks] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  return (
    <div>
      <HobitProfile />
      <Response
        text={
          isKorean
            ? `안녕하세요! 
저는 정보대학 챗봇 호빗(hoBIT)이에요

카테고리를 통해 정보대학 행정 관련 정보를,
선배모드에서는 학교 관련 정보를 알 수 있어요!

할 수 있는 일을 통해 호빗에 대해서 자세히 알아보세요!!`
            : `Hello!
I’m hoBIT, the chatbot for the College of Informatics.

You can find administrative information about the College of Informatics through categories,
and in Senior Mode, you can access general school-related information!

Check out what I can do to learn more about hoBIT!`
        }
        faqs={mocks}
      />
    </div>
  );
};

export default GreetResponse;
