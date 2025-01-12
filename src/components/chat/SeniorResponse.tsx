import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import SeniorHobitProfile from './SeniorHobitProfile';
import { useEffect, useState } from 'react';
import { getSeniorFAQById } from '../../api/query';
import { SeniorFAQ } from '../../types/faq';

interface SeniorResponseProps {
  seniorFaqId: number;
}

const SeniorResponse: React.FC<SeniorResponseProps> = ({ seniorFaqId }) => {
  const [seniorFAQ, setSeniorFAQ] = useState<SeniorFAQ | null>(null);

  useEffect(() => {
    const fetchSeniorFAQById = async () => {
      try {
        const fetchedSeniorFAQ = await getSeniorFAQById({ id: seniorFaqId });

        const parsedFaq = {
          ...fetchedSeniorFAQ.seniorFaq,
          answer_ko: JSON.parse(fetchedSeniorFAQ.seniorFaq.answer_ko),
          answer_en: JSON.parse(fetchedSeniorFAQ.seniorFaq.answer_en),
        };

        setSeniorFAQ(parsedFaq);
        console.log('Fetched and parsed senior faq:', parsedFaq);
      } catch (error) {
        console.error('Failed to fetch all senior FAQs:', error);
      }
    };

    fetchSeniorFAQById();
  }, [seniorFaqId]);

  //if (!matchedFaq) {
  //	return (
  //		<div>
  //			<SeniorHobitProfile />
  //			<p>No matching FAQ found for ID: {seniorFaqId}</p>
  //		</div>
  //	);
  //}

  return (
    <div>
      <SeniorHobitProfile />
      <div className="flex flex-row">
        {seniorFAQ &&
          Array.isArray(seniorFAQ.answer_ko) &&
          seniorFAQ.answer_ko.map((answer, index) => (
            <div
              key={index}
              className="font-5medium text-[20px] bg-[#FFEFEF] mt-[10px] rounded-[20px] px-[20px] py-[15px] w-[365px] break-words inline-block mr-[10px]"
            >
              {index === 0 && (
                <div className="flex flex-row text-[16px] text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                  <h3 className="font-5medium">{seniorFAQ.maincategory_ko}</h3>
                  <IoIosArrowForward />
                  <h3 className="font-4regular">{seniorFAQ.subcategory_ko}</h3>
                  <IoIosArrowForward />
                  <h3 className="font-4regular">
                    {seniorFAQ.detailcategory_ko}
                  </h3>
                </div>
              )}
              {(answer.url || answer.email || answer.phone) && (
                <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
              )}
              {answer.url && (
                <div className="flex flex-row items-center mt-[20px]">
                  <FaLink className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <a
                    href={
                      answer.url.startsWith('http')
                        ? answer.url
                        : `http://${answer.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[18px] text-[#0A5EB0] cursor-pointer hover:underline"
                  >
                    {answer.url}
                  </a>
                </div>
              )}
              {answer.email && (
                <div className="flex flex-row items-center mt-[10px]">
                  <MdOutlineEmail className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <p className="text-[18px]">{answer.email}</p>
                </div>
              )}
              {answer.phone && (
                <div className="flex flex-row items-center mt-[10px]">
                  <FaPhoneVolume className="mr-[10px] text-[36px] text-[#686D76] bg-white p-[8px] rounded-full" />
                  <p className="text-[18px]">{answer.phone}</p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SeniorResponse;
