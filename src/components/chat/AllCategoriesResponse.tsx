import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoChevronBackOutline } from 'react-icons/io5';
import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import HobitProfile from './HobitProfile';
import Response from './Response';
import { FaqTree } from '../../lib/FaqTree';
import { getAllFAQs } from '../../api/query';
import { Faq } from '../../types/faq';

const AllCategoriesResponse: React.FC = () => {
  const dispatch = useDispatch();
  const [faqTree, setFaqTree] = useState<FaqTree | null>(null);
  const [allFaqs, setAllFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<
    { mainCategory: string; subCategories: string[] }[]
  >([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<string | null>(
    null
  );
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const faqTreeInitFlag = useRef(false);

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));
    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
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
    if (!faqTreeInitFlag.current && allFaqs.length > 0) {
      const tree = new FaqTree(allFaqs);
      setFaqTree(tree);

      const mainCategories = Object.keys(tree.tree);
      const extractedCategories = mainCategories.map((mainCategory) => ({
        mainCategory,
        subCategories: Object.keys(tree.tree[mainCategory]),
      }));

      setCategories(extractedCategories);

      faqTreeInitFlag.current = true;
    }
  }, [allFaqs]);

  const showAllCategories = () => {
    setCurrentCategory(null);
    setCurrentSubCategory(null);
  };

  const showSubCategory = (mainCategory: string) => {
    setCurrentCategory(mainCategory);
    setCurrentSubCategory(null);
  };

  const showQuestions = (subCategory: string) => {
    setCurrentSubCategory(subCategory);
  };

  return (
    <div>
      <HobitProfile />
      {!currentCategory && (
        <>
          <Response
            text={
              isKorean
                ? `할 수 있는 일 카테고리예요!\n카테고리를 클릭해서 세부 카테고리를 확인해보세요`
                : `Here's what I can do!\nFeel free to ask more if you have any other questions.`
            }
            faqs={[]}
          />
          <div className="flex flex-row flex-wrap">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-gray-100 w-[100px] h-[100px] flex flex-col items-center justify-center rounded-[20px] m-[10px] hover:bg-gray-200 cursor-pointer"
                onClick={() => showSubCategory(category.mainCategory)}
              >
                <span className="text-[30px]">{/* Optional emoji/icon */}</span>
                <span className="text-[18px] font-6semibold">
                  {category.mainCategory}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {currentCategory && !currentSubCategory && (
        <>
          <div
            onClick={showAllCategories}
            className="bg-gray-100 pl-[15px] pr-[20px] cursor-pointer rounded-[20px] w-fit flex flex-row items-center py-[10px] mt-[10px] text-[20px] font-6semibold text-[#686D76] hover:bg-gray-200"
          >
            <IoChevronBackOutline className="text-[18px] mr-[10px]" />
            전체 카테고리 보기
          </div>
          <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
            <div>
              <button className="font-6semibold text-[20px] inline-block">
                {currentCategory}
              </button>
            </div>
            <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
            <div className="mt-[5px] w-full flex flex-wrap">
              {faqTree?.tree[currentCategory] &&
                Object.keys(faqTree.tree[currentCategory]).map(
                  (subCategory: string, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-100 w-[100px] h-[100px] flex flex-col items-center justify-center rounded-[20px] m-[10px] hover:bg-gray-200 cursor-pointer"
                      onClick={() => showQuestions(subCategory)}
                    >
                      <span className="text-[18px] font-6semibold">
                        {subCategory}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        </>
      )}

      {currentCategory && currentSubCategory && (
        <>
          <div
            onClick={() => setCurrentSubCategory(null)}
            className="bg-gray-100 pl-[15px] pr-[20px] cursor-pointer rounded-[20px] w-fit flex flex-row items-center py-[10px] mt-[10px] text-[20px] font-6semibold text-[#686D76] hover:bg-gray-200"
          >
            <IoChevronBackOutline className="text-[18px] mr-[10px]" />
            {currentCategory}
          </div>
          <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
            <div>
              <button className="font-6semibold text-[20px] inline-block">
                {currentSubCategory}
              </button>
            </div>
            <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
            <div className="mt-[5px] w-full flex flex-wrap">
              {faqTree?.tree[currentCategory]?.[currentSubCategory]?.map(
                (faq, index: number) => {
                  return (
                    <div
                      key={index}
                      className="w-full text-left flex flex-col mb-[10px]"
                    >
                      <button
                        onClick={() =>
                          handleSendKeyword(
                            isKorean ? faq.question_ko : faq.question_en
                          )
                        }
                        className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
                      >
                        {isKorean ? faq.question_ko : faq.question_en}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllCategoriesResponse;
