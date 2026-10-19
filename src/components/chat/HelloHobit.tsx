import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import HobitProfile from './HobitProfile';
import MainOptions from './MainOptions';
import Response from './Response';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';
import { getStartRecommendations } from '../../api/query';
import RecChips, { RecItem } from './RecChips';

const HelloHobit: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [startItems, setStartItems] = useState<RecItem[]>([]);

  useEffect(() => {
    getStartRecommendations().then(setStartItems);
  }, []);

  return (
    // 좁은 화면에서 카드 오른쪽 여유 (대화 답변과 같은 28px)
    <div className="pr-[28px] md:pr-0">
      <HobitProfile />
      <MainOptions />
      <Response
        text={
          isKorean
            ? `안녕하세요\n저는 고려대학교 정보대학 챗봇\n호빗(hoBIT)이에요!\n\n정보대학 학부 관련 궁금한 점이 있다면\n언제든지 저에게 질문해주세요`
            : `Hello!\nI'm hoBIT, the chatbot of the College of Informatics at Korea University.\n\nIf you have any questions regarding the undergraduate program in the College of Informatics, feel free to ask me anytime!`
        }
        faqs={faqs}
      />
      <RecChips title={isKorean ? '요즘 많이 묻는 질문' : 'Popular questions'} items={startItems} />
    </div>
  );
};

export default HelloHobit;
