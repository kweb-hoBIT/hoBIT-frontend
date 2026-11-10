import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import errorImg from '../../assets/error_image.png';

import HobitProfile from './HobitProfile';
import Response from './Response';
import MultipleResponse from './MultipleResponse';
import Survey from './Survey';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';
import Loading from './Loading';
import { ProgressStep } from '../../api/questionStream';

type HobitResponseProps = {
  faqs: Faq[];
  loading: boolean;
  streamText?: string; // 스트리밍 중인 답변 (완료되면 faqs로 최종 카드를 그림)
  streamStyle?: string; // senior면 선배 답변 색
  stopped?: boolean; // '답변 중지'로 멈춤 — 받은 데까지의 글 + 멈췄다는 표시
  progress?: ProgressStep[]; // 답변 전까지 끝난 단계 — 로딩 중 체크 목록
};

// 스트리밍 표시용 정리: 출처 태그([S1]·[M1]·끝에 잘린 '[S')와 마크다운 강조 기호 제거
const cleanStreamText = (text: string) =>
  text
    .replace(/\s*\[\s*[SM]?\s*\d{1,2}\s*\]/g, '')
    .replace(/\[\s*[SM]?\s*\d*$/, '')
    .replace(/\*\*/g, '')
    .replace(/^#{1,3}\s*/gm, '');

// 스트리밍 중 말풍선 — 받은 글은 바로 보여줌 (글자 단위로 풀어 보여주는 효과는 쓰지 않음)
// stoppedNote가 있으면 멈춘 말풍선 — 깜빡이는 커서 대신 끝에 작은 안내
const StreamBubble: React.FC<{ text: string; senior: boolean; stoppedNote?: string }> = ({ text, senior, stoppedNote }) => {
  const shown = cleanStreamText(text).trimEnd();
  return (
    <div className={`${senior ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[10px] rounded-[20px] px-[20px] py-[15px] hobit-bubble ${stoppedNote && !shown ? 'w-fit' : 'w-full max-w-[520px] md:max-w-none md:w-[350px]'} break-words whitespace-pre-wrap`}>
      {stoppedNote ? shown : cleanStreamText(text)}
      {stoppedNote ? (
        <span className={`${shown ? 'ml-[4px]' : ''} text-f-caption text-ink-3`}>{stoppedNote}</span>
      ) : (
        <span className="inline-block w-[6px] h-[1em] ml-[2px] align-middle bg-ink-2 animate-pulse" />
      )}
    </div>
  );
};

const GeneralResponse: React.FC<HobitResponseProps> = ({
  faqs: newFaqs,
  loading,
  streamText,
  streamStyle,
  stopped,
  progress,
}) => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const [isImageReady, setIsImageReady] = useState(false);

  useEffect(() => {
    if (newFaqs) {
      setFaqs(newFaqs);
    }
  }, [newFaqs]);

  useEffect(() => {
    if (loading) {
      setIsImageReady(false);
      return;
    }

    if (newFaqs && newFaqs.length > 1) {
      const img = new Image();
      img.src = errorImg;
      img.onload = () => setIsImageReady(true);
      img.onerror = () => setIsImageReady(true);
    } else {
      setIsImageReady(true);
    }
  }, [loading, newFaqs]);

  // 중지한 답변 — 아직 한 글자도 안 왔으면 안내만
  if (stopped) {
    return (
      <div>
        <HobitProfile />
        <StreamBubble
          text={streamText ?? ''}
          senior={streamStyle === 'senior'}
          stoppedNote={isKorean ? '(답변을 멈췄어요)' : '(Stopped)'}
        />
      </div>
    );
  }

  if (loading && streamText) {
    return (
      <div>
        <HobitProfile />
        <StreamBubble text={streamText} senior={streamStyle === 'senior'} />
      </div>
    );
  }

  if (loading || !isImageReady) {
    return (
      <div>
        <HobitProfile />
        <Loading steps={loading ? progress : undefined} />
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
            width={400}
            height={400}
            decoding="async"
            className="w-[150px] md:w-[200px] h-auto aspect-square my-[10px] ml-[50px] md:ml-[60px]"
          />
          <MultipleResponse
            text={
              isKorean
                ? `질문을 제대로 이해하지 못했어요 🥲\n혹시 다음 질문을 찾으시나요?`
                : `I'm having trouble understanding your question.. 🥲\nIs these what you’re looking for?`
            }
            faqs={faqs}
          />
          {faqs[0] && (
            <div className="mt-[6px]">
              <Survey id={faqs[0].id} user_question={sentValue} />
            </div>
          )}
        </>
      ) : (
        <>
          <Response text="" faqs={faqs} />
        </>
      )}
    </div>
  );
};

// 스트리밍 중 다른 대화 항목까지 다시 그리지 않도록 (props가 같으면 건너뜀)
export default memo(GeneralResponse);
