import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoChevronBackOutline } from 'react-icons/io5';
import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import HobitProfile from './HobitProfile';
import { Category, FaqTree } from '../../lib/FaqTree';
import { SeniorFaqTree } from '../../lib/SeniorFaqTree';
import { getAllFAQs, getAllSeniorFAQs } from '../../api/query';
import { Faq, SeniorFAQ } from '../../types/faq';
import { setSeniorFaqId, clearSeniorFaqId } from '../../redux/SeniorFaqIdSlice';

const AllCategoriesResponse: React.FC = () => {
	const dispatch = useDispatch();
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
	const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
	const [currentSubCategory, setCurrentSubCategory] = useState<Category | null>(
		null
	);
	const [seniorCategories, setSeniorCategories] = useState<
		{ mainCategory: Category; subCategories: Category[] }[]
	>([]);
	const [currentSeniorCategory, setCurrentSeniorCategory] =
		useState<Category | null>(null);
	const [currentSeniorSubCategory, setCurrentSeniorSubCategory] =
		useState<Category | null>(null);

	const faqTreeInitFlag = useRef(false);
	const seniorFaqTreeInitFlag = useRef(false);

	const handleSendKeyword = (message: string) => {
		dispatch(sendInputValue(message));
		setTimeout(() => {
			dispatch(clearSentValue());
		}, 100);
	};

	const handleSendSeniorFaqId = (id: number) => {
		dispatch(setSeniorFaqId(id));
		setTimeout(() => {
			dispatch(clearSeniorFaqId());
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

	const showAllCategories = () => {
		setCurrentCategory(null);
		setCurrentSubCategory(null);
		setCurrentSeniorCategory(null);
		setCurrentSeniorSubCategory(null);
	};

	const showSubCategory = (mainCategory: Category) => {
		setCurrentCategory(mainCategory);
		setCurrentSubCategory(null);
	};

	const showQuestions = (subCategory: Category) => {
		setCurrentSubCategory(subCategory);
	};

	const showSeniorSubCategory = (mainCategory: Category) => {
		setCurrentCategory(null);
		setCurrentSubCategory(null);
		setCurrentSeniorCategory(mainCategory);
	};

	const showSeniorDetailCategory = (subCategory: Category) => {
		setCurrentSeniorSubCategory(subCategory);
	};

	return (
		<div>
			<HobitProfile />
			{!currentCategory && !currentSeniorCategory && (
				<>
					<div className="mt-[10px] flex flex-row">
						<p className="font-6semibold text-[20px] ">
							{isKorean ? '카테고리 |' : 'Categories |'}
						</p>
						<p className="font-4regular text-[20px] ml-[10px] text-[#686D76]">
							{isKorean
								? '카테고리를 클릭해보세요!'
								: 'Click The Categories Below!'}
						</p>
					</div>
					<div className="flex flex-row flex-wrap">
						{categories.map((category, index) => (
							<div
								key={index}
								className="bg-gray-100 w-[160px] h-[80px] flex flex-col items-center justify-center rounded-[20px] mt-[10px] mr-[10px] px-[10px] py-[5px] hover:bg-gray-200 cursor-pointer"
								onClick={() => showSubCategory(category.mainCategory)}
							>
								<span className="text-[18px] font-6semibold text-center">
									{isKorean
										? category.mainCategory.category_ko
										: category.mainCategory.category_en}
								</span>
							</div>
						))}
<<<<<<< Updated upstream
					</div>
					<div className="mt-[10px] flex flex-row">
						<p className="font-6semibold text-[20px]">
=======
				</div>
					<div className="mt-[20px] flex flex-row items-center">
						<p className="font-6semibold text-lg md:text-xl">
>>>>>>> Stashed changes
							{isKorean ? '선배모드 |' : 'Senior Mode |'}
						</p>
						<p className="font-4regular text-[20px] ml-[10px] text-[#686D76]">
							{isKorean
								? '정보대학 선배가 알려주는 꿀팁!'
								: 'Few tips from your seniors!'}
						</p>
					</div>
					<div className="flex flex-row flex-wrap">
						{seniorCategories.map((category, index) => (
							<div
								key={index}
								className="bg-[#FFEFEF] w-[160px] h-[80px] flex flex-col items-center justify-center rounded-[20px] mt-[10px] mr-[10px] px-[10px] py-[5px] hover:bg-[#FDDDDD] cursor-pointer"
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
					<div className="flex flex-row flex-wrap"></div>
				</>
			)}

			{currentCategory &&
				!currentSubCategory &&
				!currentSeniorCategory &&
				!currentSeniorSubCategory && (
					<>
						<div
							onClick={showAllCategories}
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-[20px] hover:text-black"
						>
							<IoChevronBackOutline className="text-[28px] mr-[10px] bg-gray-200 rounded-full p-[5px]" />
							{isKorean ? '전체 카테고리 보기' : 'All Categories'}
						</div>
						<div>
							<div className="font-6semibold text-[20px] inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentCategory.category_ko} |`
									: `${currentCategory.category_en} |`}
							</div>
						</div>
						<div className="mt-[10px] w-full flex flex-wrap gap-[10px]">
							{faqTree?.tree.get(currentCategory) &&
								Array.from(faqTree.tree.get(currentCategory)!.keys()).map(
									(subCategory: Category, index: number) => (
										<div
											key={index}
											className="hover:bg-gray-200 bg-gray-100 w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
											onClick={() => showQuestions(subCategory)}
										>
											<span className="text-[18px] font-6semibold text-center">
												{isKorean
													? subCategory.category_ko
													: subCategory.category_en}
											</span>
										</div>
									)
								)}
						</div>
					</>
				)}

			{currentCategory &&
				currentSubCategory &&
				!currentSeniorCategory &&
				!currentSeniorSubCategory && (
					<>
						<div
							onClick={() => setCurrentSubCategory(null)}
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-[#686D76] flex flex-row font-4regular text-[20px] hover:text-black"
						>
							<IoChevronBackOutline className="text-[28px] mr-[10px] bg-gray-200 rounded-full p-[5px]" />
							{isKorean
								? currentCategory.category_ko
								: currentCategory.category_en}
						</div>
						<div>
							<div className="font-6semibold text-[20px] inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentSubCategory.category_ko} |`
									: `${currentSubCategory.category_en} |`}
							</div>
						</div>
						<div className="bg-gray-100 rounded-[20px] px-[20px] py-[10px] mt-[10px] w-[500px]">
							<div className="w-full flex flex-wrap">
								{faqTree?.tree
									.get(currentCategory)
									?.get(currentSubCategory)
									?.map((faq, index: number) => {
										return (
											<div
												key={index}
												className="w-full text-left flex flex-col"
											>
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

			{!currentCategory &&
				!currentSubCategory &&
				currentSeniorCategory &&
				!currentSeniorSubCategory && (
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
							{seniorFaqTree?.tree.get(currentSeniorCategory) &&
								Array.from(
									seniorFaqTree.tree.get(currentSeniorCategory)!.keys()
								).map((subCategory: Category, index: number) => (
									<div
										key={index}
										className="hover:bg-[#FDDDDD] bg-[#FFEFEF] w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
										onClick={() => showSeniorDetailCategory(subCategory)}
									>
										<span className="text-[18px] font-6semibold text-center">
											{isKorean
												? subCategory.category_ko
												: subCategory.category_en}
										</span>
									</div>
								))}
						</div>
					</>
				)}

			{!currentCategory &&
				!currentSubCategory &&
				currentSeniorCategory &&
				currentSeniorSubCategory && (
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
							{seniorFaqTree?.tree
								.get(currentSeniorCategory)
								?.get(currentSeniorSubCategory)
								?.map((faq, index: number) => {
									return (
										<div
											key={index}
											onClick={() => handleSendSeniorFaqId(faq.id)}
											className="hover:bg-[#FDDDDD] bg-[#FFEFEF] w-[160px] h-[80px] flex items-center justify-center px-[10px] rounded-[20px] cursor-pointer"
										>
											<span className="text-[18px] font-6semibold text-center">
												{isKorean
													? faq.detailcategory_ko
													: faq.detailcategory_en}
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

export default AllCategoriesResponse;
