import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoChevronBackOutline } from 'react-icons/io5';
import { RootState } from '../../redux/store';
import { Category } from '../../lib/FaqTree';
import { SeniorFaqTree } from '../../lib/SeniorFaqTree';
import { getAllSeniorFAQs } from '../../api/query';
import { SeniorFAQ } from '../../types/faq';
import { setSeniorFaqId, clearSeniorFaqId } from '../../redux/SeniorFaqIdSlice';

interface SeniorCategoriesProps {
  subcategory?: Category;
  maincategory?: Category;
}

const SeniorCategories: React.FC<SeniorCategoriesProps> = ({
  subcategory,
  maincategory,
}) => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const [seniorFaqTree, setSeniorFaqTree] = useState<SeniorFaqTree | null>(
    null
  );
  const [allSeniorFaqs, setAllSeniorFaqs] = useState<SeniorFAQ[]>([]);
  const [seniorCategories, setSeniorCategories] = useState<
    {
      mainCategory: Category;
      subCategories: {
        subCategory: Category;
        detailCategories: Category[];
      }[];
    }[]
  >([]);

  const [currentSeniorCategory, setCurrentSeniorCategory] =
    useState<Category | null>(maincategory || null);
  const [currentSeniorSubCategory, setCurrentSeniorSubCategory] =
    useState<Category | null>(subcategory || null);

  const seniorFaqTreeInitFlag = useRef(false);

  const handleSendSeniorFaqId = (id: number) => {
    dispatch(setSeniorFaqId(id));
    setTimeout(() => {
      dispatch(clearSeniorFaqId());
    }, 100);
  };

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
    const initializeSeniorFaqTree = () => {
      if (!seniorFaqTreeInitFlag.current && allSeniorFaqs.length > 0) {
        const seniorFaqTreeInstance = new SeniorFaqTree(allSeniorFaqs);
        setSeniorFaqTree(seniorFaqTreeInstance);

        const mainCategories = Array.from(seniorFaqTreeInstance.tree.keys());
        const extractedCategories = mainCategories.map((mainCategory) => ({
          mainCategory,
          subCategories: Array.from(
            seniorFaqTreeInstance.tree.get(mainCategory)!.keys()
          ).map((subCategory) => ({
            subCategory,
            detailCategories:
              seniorFaqTreeInstance.tree
                .get(mainCategory)!
                .get(subCategory)
                ?.map((faq) => ({
                  category_ko: faq.detailcategory_ko,
                  category_en: faq.detailcategory_en,
                })) || [],
          })),
        }));

        setSeniorCategories(extractedCategories);

        seniorFaqTreeInitFlag.current = true;
      }
    };

    initializeSeniorFaqTree();
  }, [allSeniorFaqs]);

  const showAllCategories = () => {
    setCurrentSeniorCategory(null);
    setCurrentSeniorSubCategory(null);
  };

  const showSeniorSubCategory = (mainCategory: Category) => {
    setCurrentSeniorCategory(mainCategory);
  };

  const showSeniorDetailCategory = (subCategory: Category) => {
    setCurrentSeniorSubCategory(subCategory);
  };

  return (
    <div>
      {seniorFaqTree && !currentSeniorCategory && (
        <>
          <div className="font-6semibold text-[20px] py-[5px] mt-[10px]">
            {isKorean ? '선배 모드 카테고리' : 'Senior Mode Categories'}
          </div>
          <div className="mt-[10px] w-full flex flex-wrap gap-[10px]">
            {seniorCategories.map((category, index) => (
              <div
                key={index}
                className="hover:bg-[#FDDDDD] bg-[#FFEFEF] w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
                onClick={() => showSeniorSubCategory(category.mainCategory)}
              >
                <span className="text-[18px] font-6semibold text-center">
                  {isKorean
                    ? category.mainCategory.category_ko
                    : category.mainCategory.category_en}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {seniorFaqTree && currentSeniorCategory && !currentSeniorSubCategory && (
        <>
          <div
            onClick={showAllCategories}
            className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-[20px] hover:text-black"
          >
            <IoChevronBackOutline className="text-[28px] mr-[10px] bg-gray-200 rounded-full p-[5px]" />
            {isKorean ? '전체 선배모드 보기' : 'All Senior Modes'}
          </div>
          <div>
            <div className="font-6semibold text-[20px] inline-block py-[5px] mt-[10px]">
              {isKorean
                ? `${currentSeniorCategory.category_ko} |`
                : `${currentSeniorCategory.category_en} |`}
            </div>
          </div>
          <div className="mt-[10px] w-full flex flex-wrap gap-[10px]">
            {seniorCategories
              .find((category) =>
                currentSeniorCategory
                  ? category.mainCategory.category_ko ===
                      currentSeniorCategory.category_ko &&
                    category.mainCategory.category_en ===
                      currentSeniorCategory.category_en
                  : false
              )
              ?.subCategories.map((subCategory, index) => (
                <div
                  key={index}
                  className="hover:bg-[#FDDDDD] bg-[#FFEFEF] w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
                  onClick={() =>
                    showSeniorDetailCategory(subCategory.subCategory)
                  }
                >
                  <span className="text-[18px] font-6semibold text-center">
                    {isKorean
                      ? subCategory.subCategory.category_ko
                      : subCategory.subCategory.category_en}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {seniorFaqTree && currentSeniorCategory && currentSeniorSubCategory && (
        <>
          <div
            onClick={() => setCurrentSeniorSubCategory(null)}
            className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-[20px] hover:text-black"
          >
            <IoChevronBackOutline className="text-[28px] mr-[10px] bg-gray-200 rounded-full p-[5px]" />
            {isKorean
              ? currentSeniorCategory.category_ko
              : currentSeniorCategory.category_en}
          </div>
          <div>
            <div className="font-6semibold text-[20px] inline-block py-[5px] mt-[10px]">
              {isKorean
                ? `${currentSeniorSubCategory.category_ko} |`
                : `${currentSeniorSubCategory.category_en} |`}
            </div>
          </div>
          <div className="mt-[10px] w-full flex flex-wrap gap-[10px]">
            {seniorCategories
              .find((category) =>
                currentSeniorCategory
                  ? category.mainCategory.category_ko ===
                      currentSeniorCategory.category_ko &&
                    category.mainCategory.category_en ===
                      currentSeniorCategory.category_en
                  : false
              )
              ?.subCategories.find((subCategory) =>
                currentSeniorSubCategory
                  ? subCategory.subCategory.category_ko ===
                      currentSeniorSubCategory.category_ko &&
                    subCategory.subCategory.category_en ===
                      currentSeniorSubCategory.category_en
                  : false
              )
              ?.detailCategories.map((detailCategory, index) => {
                const matchedFaq = allSeniorFaqs.find(
                  (faq) =>
                    faq.maincategory_ko ===
                      currentSeniorCategory?.category_ko &&
                    faq.subcategory_ko ===
                      currentSeniorSubCategory?.category_ko &&
                    faq.detailcategory_ko === detailCategory.category_ko
                );

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (matchedFaq) {
                        handleSendSeniorFaqId(matchedFaq.id);
                      }
                    }}
                    className="hover:bg-[#FDDDDD] bg-[#FFEFEF] w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
                  >
                    <span className="text-[18px] font-6semibold text-center">
                      {isKorean
                        ? detailCategory.category_ko
                        : detailCategory.category_en}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default SeniorCategories;
