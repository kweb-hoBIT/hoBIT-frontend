import React, { lazy, memo, Suspense } from 'react';
import { MdOutlineEmail, MdOpenInNew } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import { useSelector } from 'react-redux';
import { Faq, FaqCard, SourceItem } from '../../types/faq';
import { RootState } from '../../redux/store';
import Survey from './Survey';
import { once } from '../../lib/idle';
import { revealRef } from '../../lib/reveal';

export const preloadMarkdown = once(() => import('./Markdown'));
const Markdown = lazy(preloadMarkdown);

// 마크다운 렌더러를 받는 동안 — 기호(**, #)만 떼고 줄 단위로
const PlainAnswer: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('\n').map((line, i) => {
      const clean = line.replace(/\*\*/g, '').replace(/^#{1,6}\s*/, '');
      return clean.trim() === '' ? <br key={i} /> : <p key={i} className="mb-2">{clean}</p>;
    })}
  </>
);

interface ResponseProps {
  faqs: Faq[];
  text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  // 출처가 많으면(최신 공지 목록 등) 앞의 몇 개만 보이고 나머지는 펼쳐서 보기
  const SOURCE_PREVIEW = 3;
  const [expandedSources, setExpandedSources] = React.useState<Record<number, boolean>>({});

  const normalizeCardsToBullets = (cards: FaqCard[]): FaqCard[] => {
    return cards.map((card) => {
      const lines = card.answer.split('\n');

      const updatedLines = lines.map((line) => {
        const match = line.match(/^(\s*)(#{1,6}\s+)?(\*\*)?(\d+)\.\s+(.+?)(\*\*)?\s*$/);
        if (!match) return line;

        const indent = match[1];
        const hPrefix = match[2] ?? '';
        const openBold = match[3] ?? '';
        const rest = match[5];
        const closeBold = match[6] ?? (openBold ? '**' : '');
        return `${indent}${hPrefix}${openBold}* ${rest}${closeBold}`;
      });

      return {
        ...card,
        answer: updatedLines.join('\n'),
      };
    });
  };

  const hasMetaCard = (cards: FaqCard[]): boolean =>
    cards.some(
      (card) =>
        (card.sources && card.sources.length > 0) ||
        (card.source_link && card.source_title)
    );

  const collectSources = (cards: FaqCard[]): SourceItem[] => {
    const expanded = cards.flatMap((card) => {
      if (card.sources && card.sources.length > 0) return card.sources;
      if (card.source_link && card.source_title) {
        return [
          {
            source_title: card.source_title || '',
            source_category: card.source_category || '',
            source_link: card.source_link || '',
            attachments: card.attachments || [],
          },
        ];
      }
      return [];
    });

    const seen = new Set<string>();
    return expanded.filter((source) => {
      const key = `${source.source_link}|${source.source_title}|${JSON.stringify(source.attachments || [])}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const isSeniorFaqSource = (source: SourceItem): boolean => {
    const label = (source.source_label || '').toLowerCase();
    const category = (source.source_category || '').toLowerCase();
    const title = (source.source_title || '').toLowerCase();

    return (
      label.includes('선배 faq') ||
      label.includes('senior faq') ||
      category.includes('mysql_senior_faq') ||
      category.includes('senior') ||
      title.includes('선배 faq') ||
      title.includes('senior faq')
    );
  };

  const sanitizeJSON = (jsonString: string): string => {
    return jsonString.replace(/\n/g, '\\n');
  };

  return (
    <div>
      {text && (
        <div className="h-fit bg-card font-5medium text-f-base mt-[10px] rounded-[20px] px-[20px] py-[15px] hobit-bubble w-full max-w-[400px] md:max-w-none md:w-[350px] break-words inline-block">
          {text &&
            text
              .split('\n')
              .map((line, index) =>
                line === '' ? <br key={index} /> : <p key={index}>{line}</p>
              )}
        </div>
      )}

      {faqs.length > 0 && (
        <div className="hobit-scroll-x flex flex-col md:flex-row md:flex-nowrap w-full md:overflow-x-auto md:gap-4 pb-1 md:pb-[14px]">
          {faqs.map((faq, index) => {
            const rawAnswer = isKorean ? faq.answer_ko : faq.answer_en;

            let answers: FaqCard[] = [];
            try {
              const sanitizedAnswer = sanitizeJSON(rawAnswer);
              answers = normalizeCardsToBullets(JSON.parse(sanitizedAnswer) as FaqCard[]);
            } catch (error) {
              console.error('JSON Parse Error');
              console.log('Raw Answer with Issues:', rawAnswer);
            }

            const metaSources = collectSources(answers);
            const hasSourceCard = metaSources.length > 0 && hasMetaCard(answers);
            const related = faq.related_notices ?? [];
            // 선배 답변: 백엔드가 senior로 표시했거나(스트리밍 때와 같은 기준) 출처에 선배 FAQ
            const isSeniorBySource = faq.subcategory_ko === 'senior' || metaSources.some(isSeniorFaqSource);

            return (
              <div
                key={index}
                className="w-full md:w-auto h-fit flex-shrink-0"
              >
                <div className="flex flex-col md:flex-row w-full md:w-auto md:gap-[10px]">
                  <div className="flex flex-col w-full md:w-auto">
                    <div className="flex flex-col md:flex-row w-full md:w-auto md:gap-[10px]">
                      {answers.map((item: FaqCard, itemIndex: number) => {
                        const cardContent = (
                          <div
                            key={itemIndex}
                            // 둘째 카드부터 차례로 나타남 (첫 카드는 스트리밍 말풍선을 이어받으므로 그대로)
                            style={itemIndex > 0 ? { animationDelay: `${0.08 * itemIndex}s` } : undefined}
                            className={`h-fit ${itemIndex > 0 ? 'hobit-appear' : ''} ${isSeniorBySource ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[8px] rounded-[20px] px-[20px] py-[15px] hobit-bubble w-full max-w-[400px] md:max-w-none md:w-[350px] break-words inline-block`}
                          >
                            {itemIndex === 0 && (
                              <>
                                <div className="flex flex-row text-f-sm text-ink-2 items-center rounded-[10px] w-fit mb-[10px]">
                                  <h3 className="text-center">
                                    {isKorean
                                      ? faq.maincategory_ko
                                      : faq.maincategory_en}
                                  </h3>
                                  <IoIosArrowForward className="mx-1" />
                                  <h3 className="font-4regular text-center">
                                    {isKorean ? faq.subcategory_ko : faq.subcategory_en}
                                  </h3>
                                </div>
                                <div className="text-ink font-7bold text-f-base mb-[15px] break-words">
                                  {isKorean ? faq.question_ko : faq.question_en}
                                </div>
                              </>
                            )}
                            {typeof item.answer === 'string' && (
                              <div className="text-ink">
                                {faq.id > 0 ? (
                                  item.answer.split('\n').map((line, lineIndex) =>
                                    line === '' ? <br key={lineIndex} /> : <p key={lineIndex} className="mb-2">{line}</p>
                                  )
                                ) : (
                                  // 마크다운 렌더러는 따로 받음 (첫 화면 번들에서 제외, 한가할 때 미리 받아 둠).
                                  // 아직 못 받았으면 같은 글을 줄 단위로 먼저 보여 줌
                                  <Suspense fallback={<PlainAnswer text={item.answer} />}>
                                    <Markdown text={item.answer} />
                                  </Suspense>
                                )}
                              </div>
                            )}

                            {(item.url || item.email || item.phone) && (
                              <div className="w-full h-[1px] bg-card-3 mt-[20px]" />
                            )}
                            {item.url && (
                              <div className="flex flex-row items-center mt-[10px]">
                                <MdOpenInNew className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-ink-2 bg-surface p-[8px] rounded-full" />
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-f-base text-link hover:underline break-all"
                                >
                                  {item.url}
                                </a>
                              </div>
                            )}
                            {item.email && (
                              <div className="flex flex-row items-center mt-[10px]">
                                <MdOutlineEmail className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-ink-2 bg-surface p-[8px] rounded-full" />
                                <p className="text-f-base break-all">
                                  {item.email}
                                </p>
                              </div>
                            )}
                            {item.phone && (
                              <div className="flex flex-row items-center mt-[10px]">
                                <FaPhoneVolume className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-ink-2 bg-surface p-[8px] rounded-full" />
                                <p className="text-f-base">{item.phone}</p>
                              </div>
                            )}
                          </div>
                        );

                        if (!hasSourceCard && itemIndex === answers.length - 1) {
                          return (
                            <div key={itemIndex} className="flex flex-col">
                              {cardContent}
                              <div className="mt-0">
                                <Survey id={faq.id} user_question={sentValue} isSenior={isSeniorBySource} logId={faq.log_id} />
                              </div>
                            </div>
                          );
                        }

                        return cardContent;
                      })}
                    </div>
                  </div>

                  {(hasSourceCard || related.length > 0) && (
                    <div ref={revealRef} className="flex flex-col">
                      {hasSourceCard && (
                      <div className={`h-fit ${isSeniorBySource ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[8px] rounded-[20px] px-[20px] py-[15px] hobit-bubble w-full max-w-[400px] md:max-w-none md:w-[350px] break-words inline-block`}>
                        <p className="text-sm text-ink-2 font-4regular mb-[8px]">
                          {isKorean ? '출처' : 'Source'}
                        </p>
                        <div className="flex flex-col gap-[12px]">
                          {(expandedSources[index] ? metaSources : metaSources.slice(0, SOURCE_PREVIEW)).map((source: SourceItem, sourceIndex: number) => (
                            <div key={sourceIndex}>
                              {source.source_label && (
                                <p className="text-xs text-ink-2 font-4regular mb-[3px]">{source.source_label}</p>
                              )}
                              {source.source_link && source.source_title ? (
                                <a
                                  href={source.source_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-f-sm text-link hover:underline break-words cursor-pointer"
                                >
                                  {source.source_title}
                                </a>
                              ) : (
                                <p className="text-f-sm text-ink break-words">
                                  {source.source_title || (isKorean ? '링크 없는 출처' : 'Source without link')}
                                </p>
                              )}

                            </div>
                          ))}
                        </div>
                        {metaSources.length > SOURCE_PREVIEW && (
                          <button
                            type="button"
                            onClick={() => setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }))}
                            className="mt-[10px] text-sm text-ink-2 font-4regular hover:text-ink"
                          >
                            {expandedSources[index]
                              ? (isKorean ? '접기' : 'Show less')
                              : (isKorean ? `출처 ${metaSources.length - SOURCE_PREVIEW}개 더 보기` : `Show ${metaSources.length - SOURCE_PREVIEW} more`)}
                          </button>
                        )}
                      </div>
                      )}
                      {/* 관련 공지 — 질문 주제와 맞고 아직 신청할 수 있는 공지 (출처 카드와 같은 모양) */}
                      {related.length > 0 && (
                        <div className="h-fit bg-card font-5medium text-f-base mt-[8px] rounded-[20px] px-[20px] py-[15px] hobit-bubble w-full max-w-[400px] md:max-w-none md:w-[350px] break-words inline-block">
                          <p className="text-sm text-ink-2 font-4regular mb-[8px]">{isKorean ? '관련 공지' : 'Related notices'}</p>
                          <div className="flex flex-col gap-[12px]">
                            {related.map((n) => (
                              <div key={n.link || n.title}>
                                <p className="text-xs font-4regular mb-[3px] text-ink-2">
                                  <span className={n.status === 'open' && n.d_day <= 2 ? 'font-6semibold text-accent-ink' : ''}>
                                    {n.status === 'upcoming'
                                      ? (isKorean ? '신청 예정' : 'Upcoming')
                                      : n.d_day === 0 ? (isKorean ? '오늘 마감' : 'Due today') : `D-${n.d_day}`}
                                  </span>
                                  {` · ${isKorean ? '마감' : 'Due'} ${Number(n.due_end_date.slice(5, 7))}/${Number(n.due_end_date.slice(8, 10))}`}
                                </p>
                                {n.link ? (
                                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-f-sm text-link hover:underline break-words cursor-pointer">
                                    {n.title}
                                  </a>
                                ) : (
                                  <p className="text-f-sm text-ink break-words">{n.title}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {hasSourceCard && (
                      <div className="mt-0">
                        <Survey id={faq.id} user_question={sentValue} isSenior={isSeniorBySource} logId={faq.log_id} />
                      </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 같은 답변을 다시 그리지 않게 (언어·출처 펼침이 바뀔 때만)
export default memo(Response);
