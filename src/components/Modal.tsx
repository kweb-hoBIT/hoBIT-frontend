import { IoClose, IoChatbubbles } from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa6';
import { FaChevronUp } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { RiEditFill } from 'react-icons/ri';
import { IoSparkles } from 'react-icons/io5';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import ProfilePanel from './ProfilePanel';
import { closeMenu } from '../redux/menuSlice';
import { sendFaqById } from '../redux/inputSlice';
import { setSeniorFaqId, clearSeniorFaqId } from '../redux/SeniorFaqIdSlice';
import { openLiveChat } from '../redux/liveChatSlice';

import { Category, FaqTree } from '../lib/FaqTree';
import { directUserFeedback, getAllFAQs, getAllSeniorFAQs, moderateContent } from '../api/query';
import { SeniorFaqTree } from '../lib/SeniorFaqTree';
import { Faq, SeniorFAQ } from '../types/faq';
import { appAlert } from './ui/Dialog';
import {check as korcenCheck} from 'korcen';

const Modal: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const [faqTree, setFaqTree] = useState<FaqTree | null>(null);
  const [seniorFaqTree, setSeniorFaqTree] = useState<SeniorFaqTree | null>(
    null
  );
  const [allFaqs, setAllFaqs] = useState<Faq[]>([]);
  const [allSeniorFaqs, setAllSeniorFaqs] = useState<SeniorFAQ[]>([]);

  const [categories, setCategories] = useState<
    { mainCategory: Category; subCategories: Category[] }[]
  >([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<{
    [categoryName: string]: string[];
  }>({});
  const faqTreeInitFlag = useRef(false);
  const seniorFaqTreeInitFlag = useRef(false);

  const [seniorCategories, setSeniorCategories] = useState<
    { mainCategory: Category; subCategories: Category[] }[]
  >([]);
  const [expandedSeniorMainCategories, setExpandedSeniorMainCategories] =
    useState<string[]>([]);
  const [expandedSeniorSubCategories, setExpandedSeniorSubCategories] =
    useState<{
      [mainCategory: string]: string[];
    }>({});

  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1차: korcen으로 욕설 검사 (한국어일 때만)
      if (isKorean && korcenCheck(feedback)){
        appAlert('부적절한 내용이 포함되어 있습니다.');
        return;
      }
      
      // 2차: OpenAI moderation 검사 (한/영 모두)
      const moderationResult = await moderateContent(feedback);
      const allowed = moderationResult?.allowed ?? true;
      const reason = moderationResult?.reason ?? {};
      
      if (!allowed) {
        const categories = Object.entries(reason)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', ');

          appAlert(
            isKorean
            ? `부적절한 내용이 포함되어 있습니다.`
            : `Inappropriate content detected`
          );
          return;
      }

      await directUserFeedback({
        feedback_detail: feedback,
        language: isKorean ? 'KO' : 'EN',
      });
      setFeedback('');
      appAlert(
        isKorean
          ? '피드백이 성공적으로 전송되었습니다.'
          : 'Feedback sent successfully!'
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const fetchedFaqs = await getAllFAQs();
        setAllFaqs(fetchedFaqs.faqs);
      } catch (error) {
        console.error('Failed to fetch all FAQs:', error);
      }
    };

    fetchFAQs();
  }, []);

  useEffect(() => {
    const fetchSeniorFAQs = async () => {
      try {
        const fetchedSeniorFaqs = await getAllSeniorFAQs();
        setAllSeniorFaqs(fetchedSeniorFaqs.seniorFaqs);
      } catch (error) {
        console.error('Failed to fetch all senior FAQs:', error);
      }
    };

    fetchSeniorFAQs();
  }, []);

  useEffect(() => {
    if (!faqTreeInitFlag.current && allFaqs.length > 0) {
      const faqTree = new FaqTree(allFaqs);
      setFaqTree(faqTree);

      const mainCategories = Array.from(faqTree.tree.keys());
      const extractedCategories = mainCategories.map((mainCategory) => ({
        mainCategory,
        subCategories: Array.from(faqTree.tree.get(mainCategory)!.keys()),
      }));

      setCategories(extractedCategories);

      faqTreeInitFlag.current = true;
    }
  }, [allFaqs]);

  useEffect(() => {
    if (!seniorFaqTreeInitFlag.current && allSeniorFaqs.length > 0) {
      const seniorFaqTree = new SeniorFaqTree(allSeniorFaqs);
      setSeniorFaqTree(seniorFaqTree);

      const mainCategories = Array.from(seniorFaqTree.tree.keys());
      const extractedCategories = mainCategories.map((mainCategory) => ({
        mainCategory,
        subCategories: Array.from(seniorFaqTree.tree.get(mainCategory)!.keys()),
      }));

      setSeniorCategories(extractedCategories);

      seniorFaqTreeInitFlag.current = true;
    }
  }, [allSeniorFaqs]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      if (prev.includes(categoryName)) {
        setExpandedSubCategories((prevSubCategories) => {
          const updatedSubCategories = { ...prevSubCategories };
          delete updatedSubCategories[categoryName];
          return updatedSubCategories;
        });
        return prev.filter((name) => name !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleSendFaqById = (id: number, query: string) => {
    dispatch(sendFaqById({ id, query }));
    dispatch(closeMenu());
  };

  const handleSendSeniorFaqId = (id: number) => {
    dispatch(setSeniorFaqId(id));
    dispatch(closeMenu());
    setTimeout(() => {
      dispatch(clearSeniorFaqId());
    }, 100);
  };

  const toggleSubCategory = (categoryName: string, subCategoryName: string) => {
    setExpandedSubCategories((prev) => {
      const categorySubs = prev[categoryName] || [];
      const updatedSubs = categorySubs.includes(subCategoryName)
        ? categorySubs.filter((name) => name !== subCategoryName)
        : [...categorySubs, subCategoryName];

      return { ...prev, [categoryName]: updatedSubs };
    });
  };

  const toggleSeniorMainCategory = (mainCategory: string) => {
    setExpandedSeniorMainCategories((prev) => {
      if (prev.includes(mainCategory)) {
        setExpandedSeniorSubCategories((prevSubCategories) => {
          const updatedSubCategories = { ...prevSubCategories };
          delete updatedSubCategories[mainCategory];
          return updatedSubCategories;
        });
        return prev.filter((name) => name !== mainCategory);
      } else {
        return [...prev, mainCategory];
      }
    });
  };

  const toggleSeniorSubCategory = (
    mainCategory: string,
    subCategory: string
  ) => {
    setExpandedSeniorSubCategories((prev) => {
      const currentSubs = prev[mainCategory] || [];
      const updatedSubs = currentSubs.includes(subCategory)
        ? currentSubs.filter((name) => name !== subCategory)
        : [...currentSubs, subCategory];

      return { ...prev, [mainCategory]: updatedSubs };
    });
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 overflow-y-auto p-[20px] h-full bg-surface shadow-lg z-[60] transform transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[min(88vw,320px)] md:w-[380px] lg:w-[440px] xl:w-[480px]`}
      >
        <div className="flex flex-row justify-between items-center">
          <p className="font-6semibold text-f-lg flex flex-row items-center">
            <span className="mr-[5px]">
              {isKorean ? '카테고리' : 'Category'}
            </span>
            <BiSolidCategory className="text-[#E55604]" />
          </p>
          <button
            onClick={() => {
              dispatch(closeMenu());
            }}
            className="text-ink-3 hover:text-ink text-f-xl focus:outline-none"
          >
            <IoClose />
          </button>
        </div>
        <ProfilePanel />
        <ul className="mt-4">
          {categories.map((category, index) => (
            <li key={index} className="mb-[10px] ">
              <div
                className="hover:bg-card-2 flex flex-row justify-between items-center cursor-pointer text-f-menu font-5medium text-ink-2 bg-card px-[15px] py-[5px] lg:py-[8px] rounded-[10px]"
                onClick={() =>
                  toggleCategory(
                    isKorean
                      ? category.mainCategory.category_ko
                      : category.mainCategory.category_en
                  )
                }
              >
                <span>
                  {isKorean
                    ? category.mainCategory.category_ko
                    : category.mainCategory.category_en}
                </span>
                {expandedCategories.includes(
                  isKorean
                    ? category.mainCategory.category_ko
                    : category.mainCategory.category_en
                ) ? (
                  <FaChevronUp className="text-[0.85em] text-ink-3" />
                ) : (
                  <FaChevronDown className="text-[0.85em] text-ink-3" />
                )}
              </div>
              {expandedCategories.includes(
                isKorean
                  ? category.mainCategory.category_ko
                  : category.mainCategory.category_en
              ) && (
                <div className="relative ml-[25px]">
                  <div
                    className="absolute left-[-10px] w-[2px] bg-card-2"
                    style={{
                      top: '5px',
                      bottom: '5px',
                    }}
                  ></div>
                  <ul className="pl-[10px] mt-[10px]">
                    {category.subCategories.map((subCategory, subIndex) => (
                      <li
                        key={subIndex}
                        onClick={() =>
                          toggleSubCategory(
                            isKorean
                              ? category.mainCategory.category_ko
                              : category.mainCategory.category_en,
                            isKorean
                              ? subCategory.category_ko
                              : subCategory.category_en
                          )
                        }
                        className="cursor-pointer font-5medium text-f-base text-ink-2 hover:text-ink my-[5px]"
                      >
                        <div>
                          {isKorean
                            ? subCategory.category_ko
                            : subCategory.category_en}
                        </div>
                        {expandedSubCategories[
                          isKorean
                            ? category.mainCategory.category_ko
                            : category.mainCategory.category_en
                        ]?.includes(
                          isKorean
                            ? subCategory.category_ko
                            : subCategory.category_en
                        ) && (
                          <ul className="mt-[5px]">
                            {faqTree?.tree
                              .get(category.mainCategory)
                              ?.get(subCategory)
                              ?.map((faq, faqIndex) => (
                                <li
                                  key={faqIndex}
                                  onClick={() =>
                                    handleSendFaqById(
                                      faq.id,
                                      isKorean ? faq.question_ko : faq.question_en
                                    )
                                  }
                                  className="cursor-pointer text-f-base text-ink font-3light px-[10px] py-[5px] rounded-[10px] bg-card mb-[5px] hover:bg-card-2"
                                >
                                  {isKorean ? faq.question_ko : faq.question_en}
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="w-full h-[1px] bg-card-2 mt-[24px]" />

        <div className="mt-[20px] mb-4 flex flex-row items-center">
          <span className="font-6semibold text-f-lg">
            {isKorean ? '선배모드' : 'Senior Mode'}
          </span>
          <IoSparkles className="ml-[7px] text-[#E55604] text-f-lg" />
        </div>

        <ul className="mt-4">
          {seniorCategories.map((category, index) => (
            <li key={index} className="mb-[10px] ">
              <div
                className="hover:bg-senior-2 flex flex-row justify-between items-center cursor-pointer text-f-menu font-5medium text-ink-2 bg-senior px-[15px] py-[5px] lg:py-[8px] rounded-[10px]"
                onClick={() =>
                  toggleSeniorMainCategory(
                    isKorean
                      ? category.mainCategory.category_ko
                      : category.mainCategory.category_en
                  )
                }
              >
                <span>
                  {isKorean
                    ? category.mainCategory.category_ko
                    : category.mainCategory.category_en}
                </span>
                {expandedSeniorMainCategories.includes(
                  isKorean
                    ? category.mainCategory.category_ko
                    : category.mainCategory.category_en
                ) ? (
                  <FaChevronUp className="text-[0.85em] text-ink-3" />
                ) : (
                  <FaChevronDown className="text-[0.85em] text-ink-3" />
                )}
              </div>
              {expandedSeniorMainCategories.includes(
                isKorean
                  ? category.mainCategory.category_ko
                  : category.mainCategory.category_en
              ) && (
                <div className="relative ml-[25px]">
                  <div
                    className="absolute left-[-10px] w-[2px] bg-card-2"
                    style={{
                      top: '5px',
                      bottom: '5px',
                    }}
                  ></div>
                  <ul className="pl-[10px] mt-[10px]">
                    {category.subCategories.map((subCategory, subIndex) => (
                      <li
                        key={subIndex}
                        onClick={() =>
                          toggleSeniorSubCategory(
                            isKorean
                              ? category.mainCategory.category_ko
                              : category.mainCategory.category_en,
                            isKorean
                              ? subCategory.category_ko
                              : subCategory.category_en
                          )
                        }
                        className="cursor-pointer font-5medium text-f-base text-ink-2 hover:text-ink my-[5px]"
                      >
                        <div>
                          {isKorean
                            ? subCategory.category_ko
                            : subCategory.category_en}
                        </div>
                        {expandedSeniorSubCategories[
                          isKorean
                            ? category.mainCategory.category_ko
                            : category.mainCategory.category_en
                        ]?.includes(
                          isKorean
                            ? subCategory.category_ko
                            : subCategory.category_en
                        ) && (
                          <ul className="mt-[5px]">
                            {seniorFaqTree?.tree
                              .get(category.mainCategory)
                              ?.get(subCategory)
                              ?.map((faq, faqIndex) => (
                                <li
                                  key={faqIndex}
                                  onClick={() => {
                                    handleSendSeniorFaqId(faq.id);
                                  }}
                                  className="cursor-pointer text-f-base text-ink font-3light px-[10px] py-[5px] rounded-[10px] bg-senior mb-[5px] hover:bg-senior-2"
                                >
                                  {isKorean
                                    ? faq.detailcategory_ko
                                    : faq.detailcategory_en}
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="w-full h-[1px] bg-card-2 mt-[24px]" />

        {/* 실시간 채팅 — 행정실(일반) / 근로장학생 선배(선배 채팅) */}
        <div className="mt-[20px] mb-[12px] flex flex-row items-center">
          <span className="font-6semibold text-f-lg">{isKorean ? '실시간 채팅' : 'Live chat'}</span>
          <IoChatbubbles className="ml-[7px] text-[#E55604] text-f-lg" />
        </div>
        <div className="flex flex-col gap-[8px]">
          {([
            ['staff', isKorean ? '행정실 채팅' : 'Chat with the office', isKorean ? '평일 운영 시간에 행정실 담당자와 연결' : 'Office staff on weekdays'],
            ['senior', isKorean ? '선배 채팅' : 'Chat with a senior', isKorean ? '근로장학생 선배가 있을 때 연결' : 'When a student assistant is available'],
          ] as const).map(([chatMode, title, desc]) => (
            <button
              key={chatMode}
              type="button"
              onClick={() => {
                dispatch(closeMenu());
                dispatch(openLiveChat(chatMode));
              }}
              className={`flex flex-col items-start rounded-[12px] px-[15px] py-[8px] text-left ${
                chatMode === 'senior' ? 'bg-senior hover:bg-senior-2' : 'bg-card hover:bg-card-2'
              }`}
            >
              <span className="text-f-base font-5medium text-ink">{title}</span>
              <span className="text-f-xs text-ink-3">{desc}</span>
            </button>
          ))}
        </div>

        <div className="w-full h-[1px] bg-card-2 mt-[24px]" />

        <div className="mt-[20px] flex flex-row items-center">
          <span className="font-6semibold text-f-lg">
            {isKorean ? '피드백 남기기' : 'Leave Feedback'}
          </span>
          <RiEditFill className="ml-[5px] text-[#E55604] text-f-lg" />
        </div>
        <div className="flex flex-col mt-4">
          <textarea
            placeholder={
              isKorean
                ? '여기에 피드백을 작성해주세요!'
                : 'Please write your feedback here!'
            }
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border-none bg-card font-5medium text-base rounded-[8px] px-[15px] py-[10px] focus:outline-none focus:border-[#F075AA] resize-none"
          />
          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className={`font-6semibold py-[5px] mt-[10px] rounded-[8px] text-base transition ${
              feedback.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-card-2 text-ink-3 hover:bg-card-3'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isKorean ? '전송 중...' : 'Sending...'}
              </span>
            ) : (
              isKorean ? '제출' : 'Submit'
            )}
          </button>
        </div>
        <div className="w-full flex flex-col mt-[20px] items-center font-4regular text-[16px] text-ink-3">
          <span>copyrights@KWEB</span>
        </div>
      </div>
    </>
  );
};

export default Modal;
