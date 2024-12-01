import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import { useSelector } from 'react-redux';
import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';

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
        <div className="bg-gray-100 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block">
          {text &&
            text
              .split('\n')
              .map((line, index) =>
                line === '' ? <br key={index} /> : <p key={index}>{line}</p>
              )}
        </div>
      )}

      {faqs.length > 0 && (
        <div
          className="flex flex-row overflow-x-auto"
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
              console.log('Parsed Answers:', answers);
            } catch (error) {
              console.error('JSON Parse Error');
              console.log('Raw Answer with Issues:', rawAnswer);
            }

            return (
              <div key={index} className="flex flex-row">
                {answers.map((item: any, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="bg-gray-100 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] w-[365px] break-words inline-block mr-[10px]"
                  >
                    {itemIndex === 0 && (
                      <div className="flex flex-row text-[16px] text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                        <h3>
                          {isKorean ? faq.maincategory_ko : faq.maincategory_en}
                        </h3>
                        <IoIosArrowForward />
                        <h3 className="font-4regular">
                          {isKorean ? faq.subcategory_ko : faq.subcategory_en}
                        </h3>
                      </div>
                    )}
                    {typeof item.answer === 'string' &&
                      item.answer
                        .split('\n')
                        .map((line: string, lineIndex: number) => (
                          <p key={lineIndex}>{line}</p>
                        ))}
                    {(item.url || item.email || item.phone) && (
                      <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
                    )}
                    {item.url && (
                      <div className="flex flex-row items-center mt-[20px]">
                        <FaLink className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                        <a
                          href={
                            item.url.startsWith('http')
                              ? item.url
                              : `http://${item.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[18px] text-[#0A5EB0] cursor-pointer hover:underline"
                        >
                          {item.url}
                        </a>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex flex-row items-center mt-[10px]">
                        <MdOutlineEmail className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                        <p className="text-[18px]">{item.email}</p>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex flex-row items-center mt-[10px]">
                        <FaPhoneVolume className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                        <p className="text-[18px]">{item.phone}</p>
                      </div>
                    )}
                  </div>
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
