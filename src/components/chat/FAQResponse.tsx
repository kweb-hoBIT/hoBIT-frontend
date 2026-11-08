import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';
import { getFAQs } from '../../api/query';
import RecChips, { RecChipsSkeleton, RecItem } from './RecChips';
import { faqFitsProgram } from '../../lib/audience';

const FAQResponse: React.FC = () => {
  const [mocks, _setMocks] = useState<Faq[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loaded, setLoaded] = useState(false); // 받는 동안은 칩 자리표시
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const program = useSelector((state: RootState) => state.program.value);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const fetchedFaqs = await getFAQs();
        setFaqs(fetchedFaqs.faqs);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoaded(true);
      }
    };

    fetchFAQs();
  }, []);

  const chips: RecItem[] = faqs.filter((faq) => faqFitsProgram(faq, program)).map((faq) => ({
    intent_id: `faq-${faq.id}`,
    intent_name: '',
    text: faq.question_ko,
    text_en: faq.question_en,
    faq_id: faq.id,
  }));

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
      {/* 시작 화면 "이런 질문은 어때요?"와 같은 칩 모양 — 누르면 FAQ 원문으로 바로 답 */}
      {loaded ? <RecChips items={chips} stacked /> : <RecChipsSkeleton withTitle={false} count={4} />}
    </div>
  );
};

export default FAQResponse;
