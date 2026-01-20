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
        <div className="h-fit bg-gray-100 font-5medium text-base md:text-xl mt-[10px] rounded-[20px] px-[20px] py-[15px] w-fit max-w-[330px] md:max-w-md break-words inline-block">
          {text &&
            text
              .split('\n')
              .map((line, index) =>
                line === '' ? <br key={index} /> : <p key={index}>{line}</p>
              )}
        </div>
      )}

      {faqs.length > 0 && (
        <div className="flex flex-col md:flex-row md:flex-wrap w-full">
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
              <div key={index} className="flex flex-col md:flex-row w-full md:w-auto h-fit">
                {answers.map((item: any, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="h-fit bg-gray-100 font-5medium text-base md:text-lg mt-[10px] rounded-[20px] px-[20px] py-[15px] w-full max-w-[330px] md:max-w-none md:w-[350px] break-words inline-block md:mr-[10px]"
                  >
                    {itemIndex === 0 && (
                      <div className="flex flex-row text-sm md:text-base text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                        <h3 className="text-center">
                          {isKorean ? faq.maincategory_ko : faq.maincategory_en}
                        </h3>
                        <IoIosArrowForward className="mx-1" />
                        <h3 className="font-4regular text-center">
                          {isKorean ? faq.subcategory_ko : faq.subcategory_en}
                        </h3>
                      </div>
                    )}
                    {typeof item.answer === 'string' &&
                      item.answer
                        .split('\n')
                        .map((line: string, lineIndex: number) => (
                          <div key={lineIndex}>
                            {line === '' ? <br /> : <p>{line}</p>}
                          </div>
                        ))}

                    {(item.url || item.email || item.phone) && (
                      <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
                    )}
                    {item.url && (
                      <div className="flex flex-row items-center mt-[20px]">
                        <div className="flex items-center justify-center mr-[10px] bg-white p-[8px] rounded-full flex-shrink-0">
                          <FaLink className="text-xl md:text-xl text-[#686D76]" />
                        </div>
                        <a
                          href={
                            item.url.startsWith('http')
                              ? item.url
                              : `http://${item.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base md:text-lg text-[#0A5EB0] cursor-pointer hover:underline break-all"
                        >
                          {isKorean ? '사이트 바로가기' : 'Visit Site'}
                        </a>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex flex-row items-center mt-[10px]">
                        <MdOutlineEmail className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                        <p className="text-base md:text-lg break-all">{item.email}</p>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex flex-row items-center mt-[10px]">
                        <FaPhoneVolume className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                        <p className="text-base md:text-lg">{item.phone}</p>
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
