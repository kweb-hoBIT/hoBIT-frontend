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

  useEffect(() => {
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
  }, [currentSeniorCategory, currentSeniorSubCategory]);

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
          <div className="mt-[20px] flex flex-row items-center mb-[10px]">
            <p className="font-6semibold text-lg md:text-xl">
              {isKorean ? '선배모드 |' : 'Senior Mode |'}
            </p>
            <p className="font-4regular text-base md:text-lg ml-[10px] text-[#686D76]">
              {isKorean
                ? '정보대학 선배가 알려주는 꿀팁!'
                : 'Few tips from your seniors!'}
            </p>
          </div>
          <div className="mt-[10px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
            {seniorCategories.map((category, index) => (
              <div
                key={index}
                className="hover:bg-[#FDDDDD] bg-[#FFEFEF] min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
                onClick={() => showSeniorSubCategory(category.mainCategory)}
              >
                <span className="text-base md:text-lg font-6semibold text-center break-keep">
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
            className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-lg md:text-xl hover:text-black"
          >
            <IoChevronBackOutline className="text-xl md:text-2xl mr-[10px] bg-gray-200 rounded-full p-[5px]" />
            {isKorean ? '전체 선배모드 보기' : 'All Senior Modes'}
          </div>
          <div>
            <div className="font-6semibold text-lg md:text-xl inline-block py-[5px] mt-[10px]">
              {isKorean
                ? `${currentSeniorCategory.category_ko} |`
                : `${currentSeniorCategory.category_en} |`}
            </div>
          </div>
          <div className="mt-[10px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
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
                  className="hover:bg-[#FDDDDD] bg-[#FFEFEF] min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
                  onClick={() =>
                    showSeniorDetailCategory(subCategory.subCategory)
                  }
                >
                  <span className="text-base md:text-lg font-6semibold text-center break-keep">
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
            className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-lg md:text-xl hover:text-black"
          >
            <IoChevronBackOutline className="text-xl md:text-2xl mr-[10px] bg-gray-200 rounded-full p-[5px]" />
            {isKorean
              ? currentSeniorCategory.category_ko
              : currentSeniorCategory.category_en}
          </div>
          <div>
            <div className="font-6semibold text-lg md:text-xl inline-block py-[5px] mt-[10px]">
              {isKorean
                ? `${currentSeniorSubCategory.category_ko} |`
                : `${currentSeniorSubCategory.category_en} |`}
            </div>
          </div>
          <div className="mt-[10px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
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
                    className="hover:bg-[#FDDDDD] bg-[#FFEFEF] min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
                  >
                    <span className="text-base md:text-lg font-6semibold text-center break-keep">
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
