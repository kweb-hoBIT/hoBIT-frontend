import { IoClose } from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa6';
import { FaChevronUp } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { closeMenu } from '../redux/menuSlice';
import { sendInputValue, clearSentValue } from '../redux/inputSlice';

import { Category, FaqTree } from '../lib/FaqTree';
import { getAllFAQs } from '../api/query';
import { Faq } from '../types/faq';

const Modal: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const [faqTree, setFaqTree] = useState<FaqTree | null>(null);
  const [allFaqs, setAllFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<
    { mainCategory: Category; subCategories: Category[] }[]
  >([]);

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<{
    [categoryName: string]: string[];
  }>({});
  const faqTreeInitFlag = useRef(false);

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
    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
    dispatch(closeMenu());
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

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto p-[20px] h-full w-[350px] bg-white shadow-lg z-50 transform transition-transform duration-500 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="font-6semibold text-[20px] flex flex-row items-center">
          <span className="mr-[5px]">카테고리</span>
          <BiSolidCategory className="text-[#F075AA]" />
        </p>
        <button
          onClick={() => dispatch(closeMenu())}
          className="text-gray-500 hover:text-black text-[20px] focus:outline-none"
        >
          <IoClose />
        </button>
      </div>
      <ul className="mt-4">
        {categories.map((category, index) => (
          <li key={index} className="mb-[10px] ">
            <div
              className="hover:bg-gray-100 flex flex-row justify-between items-center cursor-pointer text-[16px] font-5medium text-[20px] text-[#686D76] bg-gray-100 px-[15px] py-[5px] rounded-[10px]"
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
                      className="cursor-pointer font-5medium text-[18px] text-[#686D76] hover:text-black my-[5px]"
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
                                    isKorean ? faq.question_ko : faq.question_en
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
    </div>
  );
};

export default Modal;
