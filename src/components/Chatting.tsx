import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HelloHobit from './chat/HelloHobit';
import GeneralResponse from './chat/GeneralResponse';
import FAQResponse from './chat/FAQResponse';
import AllCategoriesResponse from './chat/AllCategoriesResponse';
import Query from './chat/Query';
import { RootState } from '../redux/store';
import { Faq } from '../types/faq';
import { sendQuestion, getAllQuestions } from '../api/query';
import { setQuestions } from '../redux/questionsSlice';
import { resetHomeClicked } from '../redux/homeSlice';

interface ChatItem {
	query: string;
	response: Faq[];
	loading: boolean;
	flag: boolean;
}

const Chatting: React.FC = () => {
	const dispatch = useDispatch();
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const sentValue = useSelector((state: RootState) => state.input.sentValue);
	const isKorean = useSelector((state: RootState) => state.language.isKorean);
	const homeClicked = useSelector((state: RootState) => state.home.homeClicked);

	const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAllQuestions = async () => {
			try {
				const response = await getAllQuestions();
				dispatch(setQuestions(response.questions));
			} catch (err) {
				console.error('Error while fetching all questions:', err);
				setError(err as string);
			}
		};

		fetchAllQuestions();
	}, [dispatch]);

	useLayoutEffect(() => {
		if (chatContainerRef.current) {
			const container = chatContainerRef.current;
			if (container.scrollHeight > container.clientHeight) {
				setTimeout(() => {
					container.scrollTo({
						top: container.scrollHeight,
						behavior: 'smooth',
					});
				}, 50);
			}
		}
	}, [chatHistory]);

	useEffect(() => {
		if (!sentValue) return;

		const newChatItem: ChatItem = {
			query: sentValue,
			response: [],
			loading: true,
			flag: false,
		};

		setChatHistory((prevHistory) => [...prevHistory, newChatItem]);

		const fetchResponse = async () => {
			try {
				const language = isKorean ? 'KO' : 'EN';
				const serverResponse = await sendQuestion(sentValue, language);

				if (serverResponse && Array.isArray(serverResponse.faqs)) {
					setChatHistory((prevHistory) =>
						prevHistory.map((item) =>
							item.query === sentValue
								? { ...item, response: serverResponse.faqs, loading: false }
								: item
						)
					);
				} else {
					console.error('Invalid response structure:', serverResponse);
					setError('Invalid response structure');
				}
			} catch (err) {
				console.error('Error while fetching response:', err);
				setError(err as string);
				setChatHistory((prevHistory) =>
					prevHistory.map((item) =>
						item.query === sentValue ? { ...item, loading: false } : item
					)
				);
			}
		};

		fetchResponse();
	}, [sentValue]);

	useEffect(() => {
		if (homeClicked) {
			const newChatItem: ChatItem = {
				query: '',
				response: [],
				loading: false,
				flag: true,
			};

			setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
			dispatch(resetHomeClicked());
		}
	}, [homeClicked, dispatch]);

	return (
		<div
			ref={chatContainerRef}
			className="flex flex-col h-full max-h-[calc(100vh-140px)] overflow-y-auto px-[20px] py-[30px]"
		>
			<HelloHobit />
			{chatHistory.map((chatItem, index) => (
				<div key={index}>
					{chatItem.flag ? (
						<div className="mt-[40px]">
							<HelloHobit />
						</div>
					) : (
						<>
							<Query text={chatItem.query} />
							{chatItem.query === '자주 묻는 질문' ||
								chatItem.query === 'FAQ' ? (
								<FAQResponse />
							) : chatItem.query === '할 수 있는 일' ||
								chatItem.query === 'What I Can Do' ? (
								<AllCategoriesResponse />
							) : (
								<GeneralResponse
									faqs={chatItem.response}
									loading={chatItem.loading}
								/>
							)}
						</>
					)}
				</div>
			))}

			{error && <div style={{ color: 'red' }}>Error: {error}</div>}
		</div>
	);
};

export default Chatting;
