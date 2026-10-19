import React from 'react';
import { FaDownload, FaFile, FaFilePdf } from 'react-icons/fa6';
import { MdOutlineEmail, MdOpenInNew } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useSelector } from 'react-redux';
import { AttachmentItem, Faq, FaqCard, SourceItem } from '../../types/faq';
import { RootState } from '../../redux/store';
import Survey from './Survey';

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
        (card.source_link && card.source_title) ||
        (card.attachments && card.attachments.length > 0)
    );

  const collectSources = (cards: FaqCard[]): SourceItem[] => {
    const expanded = cards.flatMap((card) => {
      if (card.sources && card.sources.length > 0) return card.sources;
      if ((card.source_link && card.source_title) || (card.attachments && card.attachments.length > 0)) {
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

  const downloadAttachment = async (attachment: AttachmentItem) => {
    try {
      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.name || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      // 외부 도메인 CORS 제한 시 새 탭으로 fallback
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      {text && (
        <div className="h-fit bg-card font-5medium text-f-base mt-[10px] rounded-[20px] px-[20px] py-[15px] w-full max-w-[330px] md:max-w-none md:w-[350px] break-words inline-block">
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
                            className={`h-fit ${itemIndex > 0 ? 'hobit-appear' : ''} ${isSeniorBySource ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[8px] rounded-[20px] px-[20px] py-[15px] w-full max-w-[330px] md:max-w-none md:w-[350px] break-words inline-block`}
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
                                  <ReactMarkdown
                                    remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                                    components={{
                                      h1: ({ children }) => (
                                        <h1 className="mt-4 mb-2 text-f-base font-7bold text-ink leading-snug">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="mt-4 mb-2 text-f-base font-7bold text-ink leading-snug">
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children }) => (
                                        <h3 className="mt-3 mb-2 text-f-base font-7bold text-ink leading-snug">
                                          {children}
                                        </h3>
                                      ),
                                      p: ({ children }) => <p className="mb-2">{children}</p>,
                                      ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                                      li: ({ children }) => <li className="mb-1">{children}</li>,
                                      strong: ({ children }) => <strong className="font-7bold">{children}</strong>,
                                      table: ({ children }) => (
                                        <div className="mb-3 overflow-x-auto rounded-[12px] border border-line bg-surface">
                                          <table className="min-w-full border-collapse text-f-sm">{children}</table>
                                        </div>
                                      ),
                                      thead: ({ children }) => <thead className="bg-card">{children}</thead>,
                                      th: ({ children }) => (
                                        <th className="border-b border-line px-3 py-2 text-left font-7bold text-ink">
                                          {children}
                                        </th>
                                      ),
                                      td: ({ children }) => (
                                        <td className="border-b border-line px-3 py-2 align-top text-ink">
                                          {children}
                                        </td>
                                      ),
                                      a: ({ href, children }) => (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-link hover:underline break-all"
                                        >
                                          {children}
                                        </a>
                                      ),
                                    }}
                                  >
                                    {item.answer}
                                  </ReactMarkdown>
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
                                <Survey id={faq.id} user_question={sentValue} isSenior={isSeniorBySource} />
                              </div>
                            </div>
                          );
                        }

                        return cardContent;
                      })}
                    </div>
                  </div>

                  {hasSourceCard && (
                    <div className="flex flex-col hobit-appear">
                      <div className={`h-fit ${isSeniorBySource ? 'bg-senior' : 'bg-card'} font-5medium text-f-base mt-[8px] rounded-[20px] px-[20px] py-[15px] w-full max-w-[330px] md:max-w-none md:w-[350px] break-words inline-block`}>
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

                              {source.attachments && source.attachments.length > 0 && (
                                <div className="mt-[8px]">
                                  <p className="text-sm text-ink-2 font-4regular mb-[6px]">
                                    {isKorean ? '첨부파일' : 'Attachments'}
                                  </p>
                                  <div className="flex flex-col gap-[6px]">
                                    {source.attachments.map((attachment: AttachmentItem, attIndex: number) => (
                                      <button
                                        key={`${sourceIndex}-${attIndex}`}
                                        type="button"
                                        onClick={() => downloadAttachment(attachment)}
                                        className="flex items-center text-left text-link hover:underline break-all text-f-sm"
                                      >
                                        {attachment.type === 'pdf' ? (
                                          <FaFilePdf className="mr-[8px] text-base flex-shrink-0" />
                                        ) : (
                                          <FaFile className="mr-[8px] text-base flex-shrink-0" />
                                        )}
                                        {attachment.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
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
                      <div className="mt-0">
                        <Survey id={faq.id} user_question={sentValue} isSenior={isSeniorBySource} />
                      </div>
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

export default Response;
