import { Question } from '../types/faq';
import { Trie } from './Trie';

export const buildTrie = (questions: Question[], isKorean: boolean): Trie => {
  const trie = new Trie();
  questions.forEach((question) => {
    const questionText = isKorean ? question.question_ko : question.question_en;
    if (questionText) {
      trie.insert(questionText);
    }
  });
  return trie;
};
