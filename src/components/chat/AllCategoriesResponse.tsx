import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoChevronBackOutline } from 'react-icons/io5';
import { sendInputValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import HobitProfile from './HobitProfile';
import Response from './Response';
import { Category, FaqTree } from '../../lib/FaqTree';
import { getAllFAQs } from '../../api/query';
import { Faq } from '../../types/faq';

const AllCategoriesResponse: React.FC = () => {
	const dispatch = useDispatch();
	const [faqTree, setFaqTree] = useState<FaqTree | null>(null);
	const [allFaqs, setAllFaqs] = useState<Faq[]>([]);
	const [categories, setCategories] = useState<
		{ mainCategory: Category; subCategories: Category[] }[]
	>([]);
	const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
	const [currentSubCategory, setCurrentSubCategory] = useState<Category | null>(
		null
	);
	const isKorean = useSelector((state: RootState) => state.language.isKorean);
	const faqTreeInitFlag = useRef(false);

	const handleSendKeyword = (message: string) => {
		dispatch(sendInputValue(message));
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

	const showAllCategories = () => {
		setCurrentCategory(null);
		setCurrentSubCategory(null);
	};

	const showSubCategory = (mainCategory: Category) => {
		setCurrentCategory(mainCategory);
		setCurrentSubCategory(null);
	};

	const showQuestions = (subCategory: Category) => {
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
								className="bg-gray-100 w-[100px] h-[100px] flex flex-col items-center justify-center rounded-[20px] mt-[10px] mr-[10px] hover:bg-gray-200 cursor-pointer"
								onClick={() => showSubCategory(category.mainCategory)}
							>
								<span className="text-[30px]">{/* Optional emoji/icon */}</span>
								<span className="text-[18px] font-6semibold">
									{isKorean
										? category.mainCategory.category_ko
										: category.mainCategory.category_en}
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
								{isKorean
									? currentCategory.category_ko
									: currentCategory.category_en}
							</button>
						</div>
						<div className="w-full h-[1px] bg-gray-400 my-[5px]" />
						<div className="mt-[10px] w-full grid grid-cols-3 gap-2">
							{faqTree?.tree.get(currentCategory) &&
								Array.from(faqTree.tree.get(currentCategory)!.keys()).map(
									(subCategory: Category, index: number) => (
										<div
											key={index}
											className="bg-gray-100 w-full h-[30px] flex flex-col items-start justify-center hover:text-black cursor-pointer"
											onClick={() => showQuestions(subCategory)}
										>
											<span className="text-[20px] text-[#686D76] font-5medium text-left">
												{isKorean
													? subCategory.category_ko
													: subCategory.category_en}
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
						{isKorean
							? currentCategory.category_ko
							: currentCategory.category_en}
					</div>
					<div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
						<div>
							<button className="font-6semibold text-[20px] inline-block">
								{isKorean
									? currentSubCategory.category_ko
									: currentSubCategory.category_en}
							</button>
						</div>
						<div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
						<div className="mt-[5px] w-full flex flex-wrap">
							{faqTree?.tree
								.get(currentCategory)
								?.get(currentSubCategory)
								?.map((faq, index: number) => {
									return (
										<div key={index} className="w-full text-left flex flex-col">
											<button
												onClick={() =>
													handleSendKeyword(
														isKorean ? faq.question_ko : faq.question_en
													)
												}
												className="font-5medium text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
											>
												{isKorean ? faq.question_ko : faq.question_en}
											</button>
										</div>
									);
								})}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default AllCategoriesResponse;
