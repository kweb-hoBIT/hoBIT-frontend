import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import HobitProfile from './HobitProfile';
import MainOptions from './MainOptions';
import Response from './Response';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';
import {
  getStartRecommendations,
  peekStartRecommendations,
} from '../../api/query';
import RecChips, { RecChipsSkeleton, RecItem } from './RecChips';

const HelloHobit: React.FC = () => {
  const [faqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const program = useSelector((state: RootState) => state.program.value);
  const grad = program === 'graduate';
  // 앱이 로딩 화면에서 미리 받아 두었으면 첫 그림부터 칩까지 함께 (null = 아직 받는 중 → 자리표시)
  const [startItems, setStartItems] = useState<RecItem[] | null>(
    () => peekStartRecommendations(program) ?? null
  );

  // 학부/대학원 스위치를 바꾸면 추천도 그 과정 것으로
  useEffect(() => {
    let alive = true;
    const ready = peekStartRecommendations(program);
    setStartItems(ready ?? null);
    if (ready) return;
    getStartRecommendations(program).then(
      (items) => alive && setStartItems(items)
    );
    return () => {
      alive = false;
    };
  }, [program]);

  return (
    // 좁은 화면에서 카드 오른쪽 여유 24px·최대 400px — 내 말풍선과 구분되고 넓은 휴대폰에서도 너무 길지 않게
    <div className="pr-[24px] md:pr-0">
      <HobitProfile />
      <MainOptions />
      {/* 인사 카드는 위 캐릭터 카드(300px·넓은 화면 350px)보다 넓어지지 않게 — 영어는 줄바꿈 없이 길어 400px까지 퍼졌었음 */}
      <div className="max-w-[300px] md:max-w-[350px]">
        <Response
          text={
            isKorean
              ? `안녕하세요\n저는 고려대학교 정보대학 챗봇\n호빗(hoBIT)이에요!\n\n정보대학 ${grad ? '대학원' : '학부'} 관련 궁금한 점이 있다면\n언제든지 저에게 질문해주세요`
              : `Hello!\nI'm hoBIT, the chatbot of the College of Informatics at Korea University.\n\nIf you have any questions regarding the ${grad ? 'graduate' : 'undergraduate'} program in the College of Informatics, feel free to ask me anytime!`
          }
          faqs={faqs}
        />
      </div>
      {startItems ? (
        <RecChips
          title={isKorean ? '이런 질문은 어때요?' : 'Try asking'}
          items={startItems}
          stacked
        />
      ) : (
        <RecChipsSkeleton />
      )}
    </div>
  );
};

// 대화가 늘거나 스트리밍될 때마다 시작 화면까지 다시 그리지 않게 (props 없음, 언어·과정은 store에서 직접)
export default memo(HelloHobit);
