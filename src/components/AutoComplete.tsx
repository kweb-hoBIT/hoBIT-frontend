import { LuLightbulb } from 'react-icons/lu';
import { LuLightbulbOff } from 'react-icons/lu';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Trie } from '../lib/Trie';
import { useHobitQueryApi } from '../hooks/hobit';

const AutoComplete: React.FC = () => {
  const inputValue = useSelector((state: RootState) => state.input.value);
  const [isAutocompleteOn, setIsAutocompleteOn] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trie, setTrie] = useState<Trie | null>(null);
  const { data: questionsData } = useHobitQueryApi('all_questions');
  const questions = questionsData?.payload?.questions ?? [];

  const toggleAutocomplete = () => setIsAutocompleteOn(!isAutocompleteOn);

  React.useEffect(() => {
    if (questions.length > 0) {
      const newTrie = new Trie();
      questions.forEach((question) => {
        newTrie.insert(question.question_en);
        newTrie.insert(question.question_en);
      });
      setTrie(newTrie);
    }
  }, [questions]);

  React.useEffect(() => {
    console.log(56, inputValue);
    if (trie && inputValue.trim() && isAutocompleteOn) {
      let suggestions = trie.getSuggestions(inputValue.trim());
      console.log(7000, suggestions);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, trie, isAutocompleteOn]);

  return (
    <>
      {isAutocompleteOn ? (
        <div
          className="w-full h-[70px] bg-[#EEEEEE] rounded-t-[30px] fixed bottom-[80px] px-[20px] flex justify-between items-center"
          style={{
            boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="text-[28px]">💡</span>
          <div
            onClick={toggleAutocomplete}
            className="flex items-center px-[15px] bg-black rounded-[20px] py-[5px] hover:bg-[#aaa]"
          >
            <LuLightbulbOff className="text-white text-[18px] mr-[10px]" />
            <p className="text-white font-6semibold text-[18px]">
              자동완성 끄기
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-[70px] fixed bottom-[80px] px-[20px] flex items-end justify-end">
          <div
            onClick={toggleAutocomplete}
            className="flex items-center px-[15px] bg-black rounded-[20px] py-[5px] hover:bg-[#aaa]"
          >
            <LuLightbulb className="text-white text-[18px] mr-[10px]" />
            <p className="text-white font-6semibold text-[18px]">
              자동완성 켜기
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoComplete;
