import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaLink } from 'react-icons/fa6';
import { MdOutlineEmail } from 'react-icons/md';
import { FaPhoneVolume } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import { IoChevronBackOutline } from 'react-icons/io5';

import SeniorHobitProfile from './SeniorHobitProfile';
import HobitProfile from './HobitProfile';
import { getSeniorFAQById } from '../../api/query';
import { SeniorFAQ } from '../../types/faq';
import { RootState } from '../../redux/store';
import SeniorCategories from './SeniorCategories';
import { TbMapPinFilled } from 'react-icons/tb';

interface SeniorResponseProps {
  seniorFaqId: number;
  onBack?: () => void;
  hideProfile?: boolean;
}

const SeniorResponse: React.FC<SeniorResponseProps> = ({ seniorFaqId, onBack, hideProfile = false }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [seniorFAQ, setSeniorFAQ] = useState<SeniorFAQ | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (seniorFAQ) {
      const container = document.querySelector(
        '.flex.flex-col.h-full.overflow-y-auto'
      );
      if (container) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [seniorFAQ]);

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

  if (showCategories) {
    return null;
  }

  return (
    <div>
      {!hideProfile && <SeniorHobitProfile />}
      <div>
        <div
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              setShowCategories(true);
            }
          }}
          className="flex flex-row items-center mt-[10px] cursor-pointer text-ink-2 hover:text-ink"
        >
            <IoChevronBackOutline className="text-f-xl mr-[10px] bg-card-2 rounded-full p-[5px]" />
            <div className="font-4regular text-f-lg">
              {isKorean ? seniorFAQ?.subcategory_ko : seniorFAQ?.subcategory_en}
            </div>
          </div>
          <div className="hobit-scroll-x flex flex-col md:flex-row w-full md:overflow-x-auto md:items-start md:pb-[14px]">
            {seniorFAQ &&
              Array.isArray(
                isKorean ? seniorFAQ.answer_ko : seniorFAQ.answer_en
              ) &&
              (isKorean ? seniorFAQ.answer_ko : seniorFAQ.answer_en).map(
                (answer, index) => (
                  <div
                    key={index}
                    className="font-5medium text-f-base bg-senior mt-[10px] rounded-[20px] px-[20px] py-[15px] w-full max-w-[330px] md:max-w-none md:w-[350px] break-words md:mr-[10px] flex-shrink-0"
                  >
                    {index === 0 && (
                      <div>
                        <div className="flex flex-wrap text-f-sm text-ink-2 items-center rounded-[10px] w-fit mb-[10px]">
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
                      </div>
                    )}

                    {index === 0 && answer.title && (
                      <p className="font-7bold text-f-base mb-[15px] break-words">
                        {answer.title}
                      </p>
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
                        <div className="w-full h-[1px] bg-card-3 mt-[20px]" />
                      )}
                      {answer.url && (
                        <div className="flex flex-row items-center mt-[20px]">
                          <div className="flex items-center justify-center mr-[10px] bg-surface p-[8px] rounded-full flex-shrink-0">
                            <FaLink className="text-xl text-ink-2" />
                          </div>
                          <a
                            href={
                              answer.url.startsWith('http')
                                ? answer.url
                                : `http://${answer.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-f-base text-link cursor-pointer hover:underline break-all"
                          >
                            {isKorean ? '사이트 바로가기' : 'Visit Site'}
                          </a>
                        </div>
                      )}
                      {answer.email && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <MdOutlineEmail className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-ink-2 bg-surface p-[8px] rounded-full" />
                          <p className="text-f-base break-all">
                            {answer.email}
                          </p>
                        </div>
                      )}
                      {answer.phone && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <FaPhoneVolume className="mr-[10px] text-2xl md:text-3xl min-w-[36px] min-h-[36px] text-ink-2 bg-surface p-[8px] rounded-full" />
                          <p className="text-f-base">{answer.phone}</p>
                        </div>
                      )}
                      {answer.map.latitude && answer.map.longitude && (
                        <div className="flex flex-row items-center mt-[10px]">
                          <div className="flex items-center justify-center mr-[10px] bg-surface p-[8px] rounded-full flex-shrink-0">
                            <TbMapPinFilled className="text-xl text-ink-2" />
                          </div>
                          <a
                            href={`https://www.korea.ac.kr/campusMap/ko/view.do?srchWrd=${encodeURIComponent(
                              seniorFAQ?.detailcategory_ko ?? ''
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-f-base text-link"
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
    </div>
  );
};

export default SeniorResponse;
