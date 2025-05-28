import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import { useSelector } from 'react-redux';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';
import Text from '../common/Text';
import IconTextRow from '../common/IconTextRow';
import ChatContainer from './ChatContainer';

interface ResponseProps {
  faqs: Faq[];
  text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const sanitizeJSON = (jsonString: string): string => {
    return jsonString.replace(/\n/g, '\\n');
  };

  return (
    <div>
      {text && (
        <div className="bg-gray-100 font-5medium mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block">
          {text &&
            text
              .split('\n')
              .map((line, index) =>
                line === '' ? (
                  <br key={index} />
                ) : (
                  <Text key={index}>{line}</Text>
                )
              )}
        </div>
      )}

      {faqs.length > 0 && (
        <div
          className="flex flex-col overflow-x-auto md:flex-row"
          style={{
            maxWidth: '100%',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {faqs.map((faq, index) => {
            const rawAnswer = isKorean ? faq.answer_ko : faq.answer_en;

            let answers: any[] = [];
            try {
              const sanitizedAnswer = sanitizeJSON(rawAnswer);

              answers = JSON.parse(sanitizedAnswer);
            } catch (error) {
              console.error('JSON Parse Error');
              console.log('Raw Answer with Issues:', rawAnswer);
            }

            return (
              <div key={index} className="flex flex-col lg:flex-row">
                {answers.map((item: any, itemIndex: number) => (
                  <ChatContainer
                    key={itemIndex}
                    type="response"
                    className="font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[365px] break-words inline-block mr-[10px] items-start"
                  >
                    {/* 교환학생 > 학점인정 */}
                    {itemIndex === 0 && (
                      <div className="flex flex-row text-[16px] text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                        <h3 className="text-center">
                          {isKorean ? faq.maincategory_ko : faq.maincategory_en}
                        </h3>
                        <IoIosArrowForward />
                        <h3 className="font-4regular text-center">
                          {isKorean ? faq.subcategory_ko : faq.subcategory_en}
                        </h3>
                      </div>
                    )}

                    {/* 내용들 */}
                    {typeof item.answer === 'string' &&
                      item.answer
                        .split('\n')
                        .map((line: string, lineIndex: number) => (
                          <div key={lineIndex}>
                            {line === '' ? (
                              <br />
                            ) : (
                              <Text key={lineIndex}>{line}</Text>
                            )}
                          </div>
                        ))}

                    {(item.url || item.email || item.phone) && (
                      <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
                    )}

                    {item.url && (
                      <IconTextRow
                        type="link"
                        icon={FaLink}
                        text={isKorean ? '사이트 바로가기' : 'Visit Site'}
                        url={item.url}
                      />
                    )}
                    {item.email && (
                      <IconTextRow icon={MdOutlineEmail} text={item.email} />
                    )}
                    {item.phone && (
                      <IconTextRow icon={FaPhoneVolume} text={item.phone} />
                    )}
                  </ChatContainer>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Response;
