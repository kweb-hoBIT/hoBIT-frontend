import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoChevronBackOutline } from 'react-icons/io5';
import { RootState } from '../../redux/store';
import HobitProfile from './HobitProfile';
import SeniorHobitProfile from './SeniorHobitProfile';
import SeniorResponse from './SeniorResponse';
import { Category, FaqTree } from '../../lib/FaqTree';
import { SeniorFaqTree } from '../../lib/SeniorFaqTree';
import { getAllFAQs, getAllSeniorFAQs } from '../../api/query';
import { Faq, SeniorFAQ } from '../../types/faq';
import { softBreak } from '../../lib/softBreak';
import RecChips, { RecItem } from './RecChips';
import { faqFitsProgram } from '../../lib/audience';
import { setSeniorFaqId, clearSeniorFaqId } from '../../redux/SeniorFaqIdSlice';
import { Skeleton } from '../ui/Skeleton';

// 카테고리 칸 자리표시 — 목록을 받는 동안 같은 크기의 칸을 미리 그려 둠
const TileSkeletons: React.FC<{ count: number; senior?: boolean }> = ({ count, senior }) => (
	<>
		{Array.from({ length: count }, (_, i) => (
			<Skeleton key={i} tone={senior ? 'senior' : 'card'} className="min-h-[80px] w-full rounded-[20px]" />
		))}
	</>
);

const faqChip = (faq: Faq): RecItem => ({
	intent_id: `faq-${faq.id}`,
	intent_name: '',
	text: faq.question_ko,
	text_en: faq.question_en,
	faq_id: faq.id,
});

interface AllCategoriesResponseProps {
	initialSeniorFaqId?: number;
}

const AllCategoriesResponse: React.FC<AllCategoriesResponseProps> = ({ initialSeniorFaqId }) => {
	const dispatch = useDispatch();
	const isKorean = useSelector((state: RootState) => state.language.isKorean);
	const program = useSelector((state: RootState) => state.program.value);
	const grad = program === 'graduate';

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
	const [selectedSeniorFaqId, setSelectedSeniorFaqId] = useState<number | null>(initialSeniorFaqId || null);

	const seniorFaqTreeInitFlag = useRef(false);
	// 목록 요청이 끝났는지 (실패해도 끝남 — 자리표시가 영원히 남지 않게)
	const [faqsDone, setFaqsDone] = useState(false);
	const [seniorDone, setSeniorDone] = useState(false);

	useEffect(() => {
		if (initialSeniorFaqId && allSeniorFaqs.length > 0) {
			const faq = allSeniorFaqs.find(f => f.id === initialSeniorFaqId);
			if (faq && seniorFaqTree) {
				const mainCat = seniorCategories.find(c => 
					c.mainCategory.category_ko === faq.maincategory_ko || 
					c.mainCategory.category_en === faq.maincategory_en
				);
				if (mainCat) {
					setCurrentSeniorCategory(mainCat.mainCategory);
					const subCat = mainCat.subCategories.find(s => 
						s.category_ko === faq.subcategory_ko || 
						s.category_en === faq.subcategory_en
					);
					if (subCat) {
						setCurrentSeniorSubCategory(subCat);
					}
				}
				setSelectedSeniorFaqId(initialSeniorFaqId);
			}
		}
	}, [initialSeniorFaqId, allSeniorFaqs, seniorFaqTree, seniorCategories]);

  // 맨 아래로 붙이기는 Chatting이 내용 높이 변화를 보고 한 곳에서만 처리 (사용자가 위로 올려 읽는 중이면 건드리지 않음)

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
			} finally {
				setFaqsDone(true);
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
			} finally {
				setSeniorDone(true);
			}
		};

		fetchSeniorFAQs();
	}, []);

	// 학부/대학원 스위치에 맞는 FAQ로 메뉴를 만듦 (스위치를 바꾸면 다시 만들고 처음 화면으로)
	useEffect(() => {
		if (allFaqs.length === 0) return;
		const faqTree = new FaqTree(allFaqs.filter((faq) => faqFitsProgram(faq, program)));
		setFaqTree(faqTree);
		setCategories(
			Array.from(faqTree.tree.keys()).map((mainCategory) => ({
				mainCategory,
				subCategories: Array.from(faqTree.tree.get(mainCategory)!.keys()),
			}))
		);
		setCurrentCategory(null);
		setCurrentSubCategory(null);
	}, [allFaqs, program]);

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
			{currentSeniorCategory || selectedSeniorFaqId ? <SeniorHobitProfile /> : <HobitProfile />}
			{!currentCategory && !currentSeniorCategory && (
				<>
					<div className="mt-[10px] flex flex-row items-center">
						<p className="font-6semibold text-f-lg">
							{isKorean ? '카테고리 |' : 'Categories |'}
						</p>
						<p className="font-4regular text-f-base ml-[10px] text-ink-2">
							{isKorean
								? '카테고리를 클릭해보세요!'
								: 'Click The Categories Below!'}
						</p>
					</div>
					{grad && (
						<p className="mt-[8px] text-f-caption text-ink-2 break-keep">
							{isKorean ? '대학원 FAQ와 공통 FAQ만 보여요. 여기에 없는 내용은 질문하면 홈페이지 대학원 자료로 답해요. ' : 'Showing graduate and common FAQs only. Ask me anything else — I answer from the graduate pages. '}
							<a href="https://info.korea.ac.kr/info/grad/computer_intro.do" target="_blank" rel="noreferrer" className="underline text-ink">
								{isKorean ? '대학원 홈페이지' : 'Graduate website'}
							</a>
						</p>
					)}
					<div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-w-[1400px] gap-2 mt-[10px]">
						{(!faqsDone || (allFaqs.length > 0 && !faqTree)) && <TileSkeletons count={6} />}
						{categories.map((category, index) => (
							<div
								key={index}
								className="bg-card min-h-[80px] flex flex-col items-center justify-center rounded-[20px] px-[10px] py-[5px] hover:bg-card-2 cursor-pointer w-full"
								onClick={() => showSubCategory(category.mainCategory)}
							>
								<span className="text-f-base font-6semibold text-center break-keep [overflow-wrap:anywhere]">
									{softBreak(isKorean
										? category.mainCategory.category_ko
										: category.mainCategory.category_en)}
								</span>
							</div>
						))}
				</div>
					<div className="mt-[20px] flex flex-row items-center">
						<p className="font-6semibold text-f-lg">
							{isKorean ? '선배모드 |' : 'Senior Mode |'}
						</p>
						<p className="font-4regular text-f-base ml-[10px] text-ink-2">
							{isKorean
								? '정보대학 선배가 알려주는 꿀팁!'
								: 'Few tips from your seniors!'}
						</p>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-w-[1400px] gap-2 mt-[10px]">
						{(!seniorDone || (allSeniorFaqs.length > 0 && !seniorFaqTree)) && <TileSkeletons count={4} senior />}
						{seniorCategories.map((category, index) => (
							<div
								key={index}
								className="bg-senior min-h-[80px] flex flex-col items-center justify-center rounded-[20px] px-[10px] py-[5px] hover:bg-senior-2 cursor-pointer w-full"
								onClick={() => showSeniorSubCategory(category.mainCategory)}
							>
								<span className="text-f-base font-6semibold text-center break-keep [overflow-wrap:anywhere]">
									{softBreak(isKorean
										? category.mainCategory.category_ko
										: category.mainCategory.category_en)}
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
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-ink-2 flex flex-row font-4regular text-f-lg hover:text-ink"
						>
							<IoChevronBackOutline className="text-f-xl mr-[10px] bg-card-2 rounded-full p-[5px]" />
							{isKorean ? '전체 카테고리 보기' : 'All Categories'}
						</div>
						<div>
							<div className="font-6semibold text-f-lg inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentCategory.category_ko} |`
									: `${currentCategory.category_en} |`}
							</div>
						</div>
						<div className="mt-[10px] grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-w-[1400px] gap-2 w-full">
							{faqTree?.tree.get(currentCategory) &&
								Array.from(faqTree.tree.get(currentCategory)!.keys()).map(
									(subCategory: Category, index: number) => (
										<div
											key={index}
											className="hover:bg-card-2 bg-card min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
											onClick={() => showQuestions(subCategory)}
										>
											<span className="text-f-base font-6semibold text-center break-keep [overflow-wrap:anywhere]">
												{softBreak(isKorean
													? subCategory.category_ko
													: subCategory.category_en)}
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
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-ink-2 flex flex-row font-4regular text-f-lg hover:text-ink"
						>
							<IoChevronBackOutline className="text-f-xl mr-[10px] bg-card-2 rounded-full p-[5px]" />
							{isKorean
								? currentCategory.category_ko
								: currentCategory.category_en}
						</div>
						<div>
							<div className="font-6semibold text-f-lg inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentSubCategory.category_ko} |`
									: `${currentSubCategory.category_en} |`}
							</div>
						</div>
						{/* 시작 화면·자주 묻는 질문과 같은 칩 — 누르면 행정실 답변으로 바로 */}
						<RecChips
							items={(faqTree?.tree.get(currentCategory)?.get(currentSubCategory) ?? []).map(faqChip)}
							stacked
							instant
						/>
					</>
				)}

			{!currentCategory &&
				!currentSubCategory &&
				currentSeniorCategory &&
				!currentSeniorSubCategory && (
					<>
						<div
							onClick={showAllCategories}
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-ink-2 flex flex-row font-4regular text-f-lg hover:text-ink"
						>
							<IoChevronBackOutline className="text-f-xl mr-[10px] bg-card-2 rounded-full p-[5px]" />
							{isKorean ? '전체 카테고리 보기' : 'All Categories'}
						</div>
						<div>
							<div className="font-6semibold text-f-lg inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentSeniorCategory.category_ko} |`
									: `${currentSeniorCategory.category_en} |`}
							</div>
						</div>
						<div className="mt-[10px] grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-w-[1400px] gap-2 w-full">
							{seniorFaqTree?.tree.get(currentSeniorCategory) &&
								Array.from(
									seniorFaqTree.tree.get(currentSeniorCategory)!.keys()
								).map((subCategory: Category, index: number) => (
									<div
										key={index}
										className="hover:bg-senior-2 bg-senior min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
										onClick={() => showSeniorDetailCategory(subCategory)}
									>
										<span className="text-f-base font-6semibold text-center break-keep [overflow-wrap:anywhere]">
											{softBreak(isKorean
												? subCategory.category_ko
												: subCategory.category_en)}
										</span>
									</div>
								))}
						</div>
					</>
				)}

			{!currentCategory &&
				!currentSubCategory &&
				currentSeniorCategory &&
				currentSeniorSubCategory &&
				!selectedSeniorFaqId && (
					<>
						<div
							onClick={() => setCurrentSeniorSubCategory(null)}
							className="cursor-pointer rounded-[20px] items-center mt-[10px] text-ink-2 flex flex-row font-4regular text-f-lg hover:text-ink"
						>
							<IoChevronBackOutline className="text-f-xl mr-[10px] bg-card-2 rounded-full p-[5px]" />
							{isKorean
								? currentSeniorCategory.category_ko
								: currentSeniorCategory.category_en}
						</div>
						<div>
							<div className="font-6semibold text-f-lg inline-block py-[5px] mt-[10px]">
								{isKorean
									? `${currentSeniorSubCategory.category_ko} |`
									: `${currentSeniorSubCategory.category_en} |`}
							</div>
						</div>
						<div className="mt-[10px] grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-w-[1400px] gap-2 w-full">
							{seniorFaqTree?.tree
								.get(currentSeniorCategory)
								?.get(currentSeniorSubCategory)
								?.map((faq, index: number) => {
									return (
										<div
											key={index}
										onClick={() => setSelectedSeniorFaqId(faq.id)}
											className="hover:bg-senior-2 bg-senior min-h-[80px] flex items-center justify-center px-[10px] py-[5px] rounded-[20px] cursor-pointer"
										>
											<span className="text-f-base font-6semibold text-center break-keep [overflow-wrap:anywhere]">
												{softBreak(isKorean
													? faq.detailcategory_ko
													: faq.detailcategory_en)}
											</span>
										</div>
									);
								})}
						</div>
					</>
				)}

			{!currentCategory &&
				!currentSubCategory &&
				currentSeniorCategory &&
				selectedSeniorFaqId && (
			<div className="mt-[10px]">
				<SeniorResponse 
					seniorFaqId={selectedSeniorFaqId} 
					onBack={() => setSelectedSeniorFaqId(null)}
					hideProfile={true}
				/>
			</div>
		)}
		</div>
	);
};

export default AllCategoriesResponse;
