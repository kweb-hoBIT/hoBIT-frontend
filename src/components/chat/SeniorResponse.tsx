import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import { IoChevronBackOutline } from 'react-icons/io5';

import SeniorHobitProfile from './SeniorHobitProfile';
import { getSeniorFAQById } from '../../api/query';
import { SeniorFAQ } from '../../types/faq';
import { RootState } from '../../redux/store';
import SeniorCategories from './SeniorCategories';
import { TbMapPinFilled } from 'react-icons/tb';

interface SeniorResponseProps {
  seniorFaqId: number;
}

const SeniorResponse: React.FC<SeniorResponseProps> = ({ seniorFaqId }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [seniorFAQ, setSeniorFAQ] = useState<SeniorFAQ | null>(null);
  const [showCategories, setShowCategories] = useState(false);

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
      } catch (error) {
        console.error('Failed to fetch all senior FAQs:', error);
      }
    };

    fetchSeniorFAQById();
  }, [seniorFaqId]);

  return (
    <div>
      <SeniorHobitProfile />
      {showCategories && seniorFAQ ? (
        <SeniorCategories
          subcategory={{
            category_ko: seniorFAQ.subcategory_ko,
            category_en: seniorFAQ.subcategory_en,
          }}
          maincategory={{
            category_ko: seniorFAQ.maincategory_ko,
            category_en: seniorFAQ.maincategory_en,
          }}
        />
      ) : (
        <div>
          <div
            onClick={() => setShowCategories(true)}
            className="flex flex-row items-center mt-[10px] cursor-pointer text-[#686D76] hover:text-black"
          >
            <IoChevronBackOutline className="text-xl md:text-2xl mr-[10px] bg-gray-200 rounded-full p-[5px]" />
            <div className="font-4regular text-lg md:text-xl">
              {isKorean ? seniorFAQ?.subcategory_ko : seniorFAQ?.subcategory_en}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:flex-wrap w-full">
            {seniorFAQ &&
              Array.isArray(
                isKorean ? seniorFAQ.answer_ko : seniorFAQ.answer_en
              ) &&
              (isKorean ? seniorFAQ.answer_ko : seniorFAQ.answer_en).map(
                (answer, index) => (
                  <div
                    key={index}
                    className="font-5medium text-lg md:text-xl bg-[#FFEFEF] mt-[10px] rounded-[20px] px-[20px] py-[15px] w-full md:w-[45%] break-words inline-block md:mr-[10px]"
                  >
                    {index === 0 && (
                      <div>
                        <div className="flex flex-wrap text-sm md:text-base text-[#686D76] items-center rounded-[10px] w-fit mb-[10px]">
                          <h3 className="font-5medium text-center">
                            {isKorean
                              ? seniorFAQ.maincategory_ko
                              : seniorFAQ.maincategory_en}
                          </h3>
                          <IoIosArrowForward className="mx-1" />
                          <h3 className="font-4regular text-center">
                            {isKorean
                              ? seniorFAQ.subcategory_ko
                              : seniorFAQ.subcategory_en}
                          </h3>
                          <IoIosArrowForward className="mx-1" />
                          <h3 className="font-4regular text-center">
                            {isKorean
                              ? seniorFAQ.detailcategory_ko
                              : seniorFAQ.detailcategory_en}
                          </h3>
                        </div>
                        <p className="font-7bold text-xl md:text-2xl mb-[10px]">
                          {answer.title}
                        </p>
                      </div>
                    )}
                      {answer.image && (
                        <div className="mt-[20px]">
                          <img
                            src={answer.image}
                            alt={isKorean ? '관련 이미지' : 'Related Image'}
                            className="w-full h-auto rounded-[10px] object-cover"
                          />
                        </div>
                      )}
                      <div>
                        {answer.answer &&
                          answer.answer
                            .split('\n')
                            .map((line, index) =>
                              line === '' ? (
                                <br key={index} />
                              ) : (
                                <p key={index}>{line}</p>
                              )
                            )}
                      </div>
                      {(answer.url ||
                        answer.email ||
                        answer.phone ||
                        answer.map) && (
                        <div className="w-full h-[1px] bg-gray-300 mt-[20px]" />
                      )}
                      {answer.url && (
                        <div className="flex flex-row items-center mt-[20px]">
                          <FaLink className="mr-[10px] text-2xl md:text-3xl text-[#686D76] bg-white p-[8px] rounded-full" />
                          <a
                            href={
                              answer.url.startsWith('http')
                                ? answer.url
                                : `http://${answer.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base md:text-lg text-[#0A5EB0] cursor-pointer hover:underline break-all"
                          >
                            {isKorean ? '사이트 바로가기' : 'Visit Site'}
                          </a>
                        </div>
                      )}
                      {answer.email && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <MdOutlineEmail className="mr-[10px] text-2xl md:text-3xl text-[#686D76] bg-white p-[8px] rounded-full" />
                          <p className="text-base md:text-lg break-all">{answer.email}</p>
                        </div>
                      )}
                      {answer.phone && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <FaPhoneVolume className="mr-[10px] text-2xl md:text-3xl text-[#686D76] bg-white p-[8px] rounded-full" />
                          <p className="text-base md:text-lg">{answer.phone}</p>
                        </div>
                      )}
                      {answer.map.latitude && answer.map.longitude && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <TbMapPinFilled className="mr-[10px] text-2xl md:text-3xl text-[#686D76] bg-white p-[8px] rounded-full" />
                          <a
                            href="https://www.korea.ac.kr/campusMap/ko/view.do"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base md:text-lg text-[#0A5EB0]"
                          >
                            {isKorean
                              ? '고려대학교 캠퍼스맵'
                              : 'Korea University Campus Map'}
                          </a>
                        </div>
                      )}
                    </div>
                  )
                )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorResponse;
