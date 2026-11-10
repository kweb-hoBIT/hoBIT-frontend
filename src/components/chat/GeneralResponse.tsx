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
  progressWritten?: boolean; // 글이 나오기 시작함 → '답변 정리' ✓
  progressCollapsed?: boolean; // 체크 목록을 한 줄 요약으로 접음
};

// 스트리밍 표시용 정리: 출처 태그([S1]·[M1]·끝에 잘린 '[S')와 마크다운 강조 기호 제거
const cleanStreamText = (text: string) =>
  text
    .replace(/\s*\[\s*[SM]?\s*\d{1,2}\s*\]/g, '')
    .replace(/\[\s*[SM]?\s*\d*$/, '')
    .replace(/\*\*/g, '')
    .replace(/^#{1,3}\s*(?:[*•-]\s+)?/gm, ''); // '### * 제목'의 목록 기호도 (최종 카드와 같게)

// 스트리밍 중에도 최종 카드와 비슷하게 나눠 보여 줌 (백엔드 splitResponseIntoCards를 단순화) —
// 마지막에 최종 카드로 바뀔 때 화면이 덜 출렁이게.
// 제목(# ~ ###)에서 새 카드, 제목 없이 길어지면(어림 줄 수 기준) 문단 사이에서 새 카드
const SPLIT_LINES = 16; // 백엔드는 22줄까지 합침 — 다음 문단 길이를 아직 모르므로 조금 일찍
const CHARS_PER_LINE = 28;
const estimateLines = (s: string) =>
  s.split('\n').reduce((sum, line) => sum + (!line.trim() ? 1 : Math.max(1, Math.ceil(line.trim().length / CHARS_PER_LINE))), 0);
const splitStreamCards = (text: string): string[] => {
  const cards: string[] = [];
  let cur: string[] = [];
  for (const line of text.split('\n')) {
    const body = cur.join('\n');
    const heading = /^#{1,3}\s+/.test(line.trim());
    if (body.trim() && (heading || (!line.trim() && estimateLines(body) >= SPLIT_LINES))) {
      cards.push(body);
      cur = heading ? [line] : [];
      continue;
    }
    cur.push(line);
  }
  cards.push(cur.join('\n'));
  // 정리하고 나면 빈 카드(제목 기호만 온 순간 등)는 빼고
  const cleaned = cards.map((c) => cleanStreamText(c).trim()).filter((c) => c);
  return cleaned.length ? cleaned : [''];
};

// 스트리밍 중 말풍선 (카드 한 장) — 글을 풀어 보여 주는 박자는 Chatting(pacer)이 정함
// stoppedNote가 있으면 멈춘 말풍선 — 깜빡이는 커서 대신 끝에 작은 안내. noCursor: 마지막 카드에만 커서
const StreamBubble: React.FC<{ text: string; senior: boolean; stoppedNote?: string; noCursor?: boolean }> = ({ text, senior, stoppedNote, noCursor }) => {
  const shown = cleanStreamText(text).trimEnd();
  return (
    <div className={`${senior ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[10px] rounded-[20px] px-[20px] py-[15px] hobit-bubble ${stoppedNote && !shown ? 'w-fit' : 'w-full max-w-[400px] md:max-w-none md:w-[350px]'} break-words whitespace-pre-wrap`}>
      {stoppedNote ? shown : cleanStreamText(text)}
      {stoppedNote ? (
        <span className={`${shown ? 'ml-[4px]' : ''} text-f-caption text-ink-3`}>{stoppedNote}</span>
      ) : noCursor ? null : (
        <span className="inline-block w-[6px] h-[1em] ml-[2px] align-middle bg-ink-2 animate-pulse" />
      )}
    </div>
  );
};

// 스트리밍 카드 줄 — 최종 카드와 같은 배치 (휴대폰 세로, PC 가로). 새 카드는 살짝 나타남
const StreamCards: React.FC<{ text: string; senior: boolean; stoppedNote?: string }> = ({ text, senior, stoppedNote }) => {
  const cards = splitStreamCards(text);
  return (
    <div className="flex flex-col md:flex-row md:flex-nowrap md:gap-[10px] w-full md:overflow-x-auto hobit-scroll-x">
      {cards.map((card, i) => (
        <div key={i} className={`flex-shrink-0 ${i > 0 ? 'hobit-appear' : ''}`}>
          <StreamBubble
            text={card}
            senior={senior}
            stoppedNote={i === cards.length - 1 ? stoppedNote : undefined}
            noCursor={i < cards.length - 1}
          />
        </div>
      ))}
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
  progressWritten,
  progressCollapsed,
}) => {
  // props를 state로 옮겨 두면 최종 카드로 바뀌는 순간 한 번 빈 화면이 그려졌음 → 바로 씀
  const faqs = newFaqs ?? [];
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const [isImageReady, setIsImageReady] = useState(false);

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

  const senior = streamStyle === 'senior';
  // 체크 목록은 기다릴 때·글이 나올 때·최종 카드에서 같은 자리에 둠 — 다시 그려지지 않고 그 자리에서 접힘
  const progressEl = stopped ? null : loading ? (
    !streamText || progress ? (
      <Loading steps={progress} written={progressWritten} collapsed={progressCollapsed} />
    ) : null
  ) : progressWritten && progress?.length ? (
    <Loading steps={progress} written collapsed />
  ) : null;

  // 중지한 답변 — 아직 한 글자도 안 왔으면 안내만
  if (stopped) {
    return (
      <div>
        <HobitProfile />
        {progressEl}
        <StreamCards text={streamText ?? ''} senior={senior} stoppedNote={isKorean ? '(답변을 멈췄어요)' : '(Stopped)'} />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <HobitProfile />
        {progressEl}
        {streamText ? <StreamCards text={streamText} senior={senior} /> : null}
      </div>
    );
  }

  // 여러 후보(못 알아들음) 화면은 그림을 받은 뒤에
  if (faqs.length > 1 && !isImageReady) {
    return (
      <div>
        <HobitProfile />
        {progressEl}
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <HobitProfile />
      {progressEl}
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
