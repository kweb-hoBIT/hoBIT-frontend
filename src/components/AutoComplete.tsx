import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Trie } from '../lib/Trie';
import { sendInputValue, sendFaqById, updateLiveValue } from '../redux/inputSlice';
import { getKeywordRules, KeywordRule } from '../api/query';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
/** "빌리다" → "빌리" — 동사는 어간으로 비교 */
const stem = (s: string) => {
	const n = norm(s);
	return n.length >= 3 && n.endsWith('다') ? n.slice(0, -1) : n;
};

/**
 * 관리자 키워드 규칙에 걸리는지 — 입력에 대표 키워드·연관 단어가 들어 있거나,
 * 두 글자 이상 입력이 그 단어의 앞부분일 때 ("현장" → 현장실습)
 */
function matchRules(rules: KeywordRule[], input: string): KeywordRule[] {
	const text = norm(input);
	if (!text) return [];
	return rules.filter((r) =>
		[r.keyword, ...r.synonyms].some((w) => {
			const t = stem(w);
			return t.length > 0 && (text.includes(t) || (text.length >= 2 && t.startsWith(text)));
		})
	);
}

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
	const [rules, setRules] = useState<KeywordRule[]>([]);

	useEffect(() => {
		let alive = true;
		getKeywordRules().then((r) => alive && setRules(r));
		return () => {
			alive = false;
		};
	}, []);

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

			// 관리자 키워드 규칙: 고정 FAQ를 맨 위에, 연관 단어로 입력해도 대표 키워드가 든 질문까지
			// (예: "대여" → "대관" 질문들, "현장실습" → "현장실습이 궁금해!" 맨 위)
			const matched = isKoreanChosung ? [] : matchRules(rules, inputValue);
			if (matched.length) {
				const pinned = matched.flatMap((r) => r.pinned.map((p) => (isKorean ? p.question_ko : p.question_en)));
				const expanded = isKorean ? matched.flatMap((r) => trieKr.getSuggestionsByTokens(r.keyword)) : [];
				suggestions = Array.from(new Set([...pinned, ...suggestions, ...expanded].filter(Boolean)));
			}

			setSuggestions(suggestions);
		} else {
			setSuggestions([]);
		}
	}, [inputValue, trieKr, trieEn, isAutocompleteOn, rules]);

	const handleSuggestionClick = (suggestion: string) => {
		const matched = questions.find(
			(q) => q.question_ko === suggestion || q.question_en === suggestion
		);

		if (matched) {
			dispatch(sendFaqById({ id: matched.faq_id, query: suggestion }));
		} else {
			dispatch(sendInputValue(suggestion));
		}
		dispatch(updateLiveValue(''));
		setSuggestions([]);
	};

	return (
		<>
			<div
				className="w-full bg-card rounded-t-[30px] fixed bottom-[60px] md:bottom-[80px] px-[20px] flex flex-col items-center h-fit max-h-[180px] md:max-h-[250px] overflow-y-auto"
				style={{
					boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
				}}
			>
				{suggestions.length > 0 && (
					<div className="w-full divide-y divide-line pb-[10px] pt-[20px]">
						{suggestions.map((suggestion, index) => {
							const matchIndex = suggestion
								.toLowerCase()
								.indexOf(inputValue.toLowerCase());

							return (
								<div
									key={index}
									className="w-full font-5medium text-f-base-xl px-[15px] cursor-pointer hover:bg-surface py-[10px]"
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
