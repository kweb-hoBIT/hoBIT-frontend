import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Trie } from '../lib/Trie';
import { sendInputValue, updateLiveValue } from '../redux/inputSlice';

const AutoComplete: React.FC = () => {
	const dispatch = useDispatch();

	const isKorean = useSelector((state: RootState) => state.language.isKorean);
	const inputValue = useSelector((state: RootState) => state.input.liveValue);
	const questions = useSelector(
		(state: RootState) => state.questions.questions
	);

	const [isAutocompleteOn, _setIsAutocompleteOn] = useState<boolean>(true);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [trieKr, setTrieKr] = useState<Trie | null>(null);
	const [trieEn, setTrieEn] = useState<Trie | null>(null);
	const trieInitFlag = useRef(false);

	useEffect(() => {
		if (!trieInitFlag.current && questions.length > 0) {
			const newTrieKr = new Trie();
			const newTrieEn = new Trie();

			questions.forEach((question) => {
				newTrieKr.insert(question.question_ko);
				newTrieEn.insert(question.question_en);
			});
			setTrieKr(newTrieKr);
			setTrieEn(newTrieEn);
			trieInitFlag.current = true;
		}
	}, [questions]);

	useEffect(() => {
		if (trieKr && trieEn && inputValue.trim() && isAutocompleteOn) {
			const isKoreanChosung = /^[ㄱ-ㅎ]+$/.test(inputValue);
			let suggestions: string[];

			if (isKorean) {
				if (isKoreanChosung) {
					suggestions = trieKr.getSuggestionsByChosung(inputValue);
				} else {
					suggestions = trieKr.getSuggestionsByTokens(inputValue);
				}
			} else {
				suggestions = trieEn.getSuggestionsByTokens(inputValue);
			}

			setSuggestions(suggestions);
		} else {
			setSuggestions([]);
		}
	}, [inputValue, trieKr, trieEn, isAutocompleteOn]);

	const handleSuggestionClick = (suggestion: string) => {
		const controlCharPattern = /[\x00-\x1F\x7F]/g;
		const invalidChars = suggestion.match(controlCharPattern);

		if (invalidChars) {
			console.warn('Invalid Characters Found:', invalidChars);
		} else {
			console.log('No Invalid Characters Found.');
		}

		dispatch(sendInputValue(suggestion));
		dispatch(updateLiveValue(''));
		setSuggestions([]);
	};

	return (
		<>
			<div
				className="w-full h-[70px] bg-gray-100 rounded-t-[30px] fixed bottom-[80px] px-[20px] flex flex-col items-center h-fit max-h-[250px] overflow-y-auto"
				style={{
					boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
				}}
			>
				{suggestions.length > 0 && (
					<div className="w-full divide-y divide-gray-300 pb-[10px] pt-[20px]">
						{suggestions.map((suggestion, index) => {
							const matchIndex = suggestion
								.toLowerCase()
								.indexOf(inputValue.toLowerCase());

							return (
								<div
									key={index}
									className="w-full font-5medium text-[20px] px-[15px] cursor-pointer hover:bg-white py-[10px]"
									onClick={() => handleSuggestionClick(suggestion)}
								>
									{matchIndex !== -1 ? (
										<>
											{suggestion.slice(0, matchIndex)}
											<span className="font-bold">
												{suggestion.slice(
													matchIndex,
													matchIndex + inputValue.length
												)}
											</span>
											{suggestion.slice(matchIndex + inputValue.length)}
										</>
									) : (
										suggestion
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
};

export default AutoComplete;
