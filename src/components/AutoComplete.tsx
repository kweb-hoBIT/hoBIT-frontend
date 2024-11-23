import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Trie } from '../lib/Trie';
import { sendInputValue, updateLiveValue } from '../redux/inputSlice';

const AutoComplete: React.FC = () => {
  const dispatch = useDispatch();

  const inputValue = useSelector((state: RootState) => state.input.liveValue);
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );

  const [isAutocompleteOn, setIsAutocompleteOn] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const trieInitFlag = useRef(false);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const toggleAutocomplete = () => setIsAutocompleteOn(!isAutocompleteOn);

  useEffect(() => {
    if (!trieInitFlag.current && questions.length > 0) {
      const newTrie = new Trie();
      questions.forEach((question) => {
        newTrie.insert(question.question_en);
        newTrie.insert(question.question_ko);
      });
      setTrie(newTrie);
      trieInitFlag.current = true;
    }
  }, [questions]);

  useEffect(() => {
    if (trie && inputValue.trim() && isAutocompleteOn) {
      let suggestions = trie.getSuggestions(inputValue);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, trie, isAutocompleteOn]);

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(sendInputValue(suggestion));
    dispatch(updateLiveValue(''));
    setSuggestions([]);
  };

  return (
    <>
      {isAutocompleteOn ? (
        <div
          className="w-full h-[70px] bg-gray-100 rounded-t-[30px] fixed bottom-[80px] px-[20px] flex flex-col items-center h-fit max-h-[250px] overflow-y-auto"
          style={{
            boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex w-full py-[15px]">
            <div
              onClick={toggleAutocomplete}
              className="flex justify-end ml-auto font-6semibold text-[18px] px-[10px] text-[#686D76] rounded-[20px] py-[5px] hover:bg-[#aaa]"
            >
              {isKorean ? '자동완성 끄기' : 'Autocomplete OFF'}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="w-full divide-y divide-gray-300 pb-[10px]">
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
      ) : (
        <div className="w-full h-[70px] fixed bottom-[80px] px-[20px] flex items-end justify-end">
          <div className="flex w-full py-[15px]">
            <div
              onClick={toggleAutocomplete}
              className="flex bg-gray-200 justify-end ml-auto font-6semibold text-[18px] px-[15px] text-[#686D76] rounded-[20px] py-[5px] hover:bg-[#aaa]"
            >
              {isKorean ? '자동완성 끄기' : 'Autocomplete ON'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoComplete;
