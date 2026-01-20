import { IoClose } from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa6';
import { FaChevronUp } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { RiEditFill } from 'react-icons/ri';
import { IoSparkles } from 'react-icons/io5';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { closeMenu } from '../redux/menuSlice';
import { sendInputValue, clearSentValue } from '../redux/inputSlice';
import { setSeniorFaqId, clearSeniorFaqId } from '../redux/SeniorFaqIdSlice';

import { Category, FaqTree } from '../lib/FaqTree';
import { directUserFeedback, getAllFAQs, getAllSeniorFAQs, moderateContent } from '../api/query';
import { SeniorFaqTree } from '../lib/SeniorFaqTree';
import { Faq, SeniorFAQ } from '../types/faq';
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
      const moderationResult = await moderateContent(feedback);
      const allowed = moderationResult?.allowed ?? true;
      const reason = moderationResult?.reason ?? {};

      if (korcenCheck(feedback)){
        alert(
          isKorean
          ? `부적절한 내용이 포함되어 있습니다.`
          : `Inappropriate content detected`
        );
        return;
      }

      if (!allowed) {
        const categories = Object.entries(reason)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', ');

          alert(
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
      alert(
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

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));
    dispatch(closeMenu());
    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
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
        className={`fixed top-0 left-0 overflow-y-auto p-[20px] h-full bg-white shadow-lg z-[60] transform transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[300px] md:w-[350px]`}
      >
        <div className="flex flex-row justify-between items-center">
          <p className="font-6semibold text-lg md:text-xl flex flex-row items-center">
            <span className="mr-[5px]">
              {isKorean ? '카테고리' : 'Category'}
            </span>
            <BiSolidCategory className="text-[#E55604]" />
          </p>
          <button
            onClick={() => {
              dispatch(closeMenu());
            }}
            className="text-gray-500 hover:text-black text-xl md:text-2xl focus:outline-none"
          >
            <IoClose />
          </button>
        </div>
        <ul className="mt-4">
          {categories.map((category, index) => (
            <li key={index} className="mb-[10px] ">
              <div
                className="hover:bg-gray-200 flex flex-row justify-between items-center cursor-pointer text-base md:text-lg font-5medium text-[#686D76] bg-gray-100 px-[15px] py-[5px] rounded-[10px]"
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
                  <FaChevronUp className="text-[16px] text-gray-400" />
                ) : (
                  <FaChevronDown className="text-[16px] text-gray-400" />
                )}
              </div>
              {expandedCategories.includes(
                isKorean
                  ? category.mainCategory.category_ko
                  : category.mainCategory.category_en
              ) && (
                <div className="relative ml-[25px]">
                  <div
                    className="absolute left-[-10px] w-[2px] bg-gray-200"
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
                        className="cursor-pointer font-5medium text-base md:text-lg text-[#686D76] hover:text-black my-[5px]"
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
                                    handleSendKeyword(
                                      isKorean
                                        ? faq.question_ko
                                        : faq.question_en
                                    )
                                  }
                                  className="cursor-pointer text-[16px] text-black font-3light px-[10px] py-[5px] rounded-[10px] bg-gray-100 mb-[5px] hover:bg-gray-200"
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

        <div className="w-full h-[1px] bg-gray-200 mt-[24px]" />

        <div className="mt-[20px] mb-4 flex flex-row items-center">
          <span className="font-6semibold text-lg md:text-xl">
            {isKorean ? '선배모드' : 'Senior Mode'}
          </span>
          <IoSparkles className="ml-[7px] text-[#E55604] text-lg md:text-xl" />
        </div>

        <ul className="mt-4">
          {seniorCategories.map((category, index) => (
            <li key={index} className="mb-[10px] ">
              <div
                className="hover:bg-[#FDDDDD] flex flex-row justify-between items-center cursor-pointer text-base md:text-lg font-5medium text-[#686D76] bg-[#FFEFEF] px-[15px] py-[5px] rounded-[10px]"
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
                  <FaChevronUp className="text-[16px] text-gray-400" />
                ) : (
                  <FaChevronDown className="text-[16px] text-gray-400" />
                )}
              </div>
              {expandedSeniorMainCategories.includes(
                isKorean
                  ? category.mainCategory.category_ko
                  : category.mainCategory.category_en
              ) && (
                <div className="relative ml-[25px]">
                  <div
                    className="absolute left-[-10px] w-[2px] bg-gray-200"
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
                        className="cursor-pointer font-5medium text-base md:text-lg text-[#686D76] hover:text-black my-[5px]"
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
                                  className="cursor-pointer text-[16px] text-black font-3light px-[10px] py-[5px] rounded-[10px] bg-gray-100 mb-[5px] hover:bg-gray-200"
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

        <div className="w-full h-[1px] bg-gray-200 mt-[24px]" />

        <div className="mt-[20px] flex flex-row items-center">
          <span className="font-6semibold text-lg md:text-xl">
            {isKorean ? '피드백 남기기' : 'Leave Feedback'}
          </span>
          <RiEditFill className="ml-[5px] text-[#E55604] text-lg md:text-xl" />
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
            className="w-full border-none bg-gray-100 font-5medium text-base rounded-[8px] px-[15px] py-[10px] focus:outline-none focus:border-[#F075AA] resize-none"
          />
          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedback.trim() || isSubmitting}
            className={`font-6semibold py-[5px] mt-[10px] rounded-[8px] text-base transition ${
              feedback.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {isKorean ? '제출' : 'Submit'}
          </button>
        </div>
        <div className="w-full flex flex-col mt-[20px] items-center font-4regular text-[16px] text-gray-400">
          <span>copyrights@KWEB</span>
        </div>
      </div>
    </>
  );
};

export default Modal;
