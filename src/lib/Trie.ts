import { TrieNode } from './TrieNode';

const CHO = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

function extractChosung(word: string): string {
  return word
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        // 한글 음절 범위 (가 ~ 힣)
        const index = Math.floor((code - 0xac00) / (21 * 28));
        return CHO[index]; // 초성 반환
      }
      return char; // 한글이 아니면 그대로 반환
    })
    .join('');
}

export class Trie {
  root: TrieNode;
  chosungRoot: TrieNode; // 초성 Trie 추가

  constructor() {
    this.root = new TrieNode();
    this.chosungRoot = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;
    const chosung = extractChosung(word);

    // 일반 단어 Trie에 추가
    for (const char of word) {
      const lowerChar = char.toLowerCase();
      if (!current.children.has(lowerChar)) {
        current.children.set(lowerChar, new TrieNode());
      }
      current = current.children.get(lowerChar)!;
    }
    current.isEndOfWord = true;
    current.originalWord = word;

    // 초성 Trie에 추가
    this.insertChosung(chosung, word);
  }

  private insertChosung(chosung: string, word: string): void {
    let current = this.chosungRoot;

    for (const char of chosung) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
    current.originalWord = word;
  }

  find(prefix: string): TrieNode | null {
    let current = this.root;

    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }

    return current;
  }

  getSuggestionsIncluding(input: string): string[] {
    const suggestions: string[] = [];
    this.collectAllWordsIncluding(this.root, '', suggestions);
    return suggestions.filter((word) => word.includes(input));
  }

  private collectAllWordsIncluding(
    node: TrieNode,
    currentWord: string,
    suggestions: string[]
  ): void {
    if (node.isEndOfWord && node.originalWord) {
      suggestions.push(node.originalWord);
    }

    for (const [char, childNode] of node.children) {
      this.collectAllWordsIncluding(childNode, currentWord + char, suggestions);
    }
  }

  getSuggestionsByChosung(input: string): string[] {
    const chosungInput = extractChosung(input);
    const node = this.findChosung(chosungInput);
    const suggestions: string[] = [];

    if (node) {
      this.collectAllWordsIncluding(node, '', suggestions);
    }

    return suggestions;
  }

  private findChosung(chosung: string): TrieNode | null {
    let current = this.chosungRoot;

    for (const char of chosung) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }

    return current;
  }

  getSuggestionsByTokens(input: string): string[] {
    const tokens = this.parseInputToTokens(input);
    if (tokens.length === 0) return [];

    let matchingEntries = this.getSuggestionsIncluding(tokens[0]);

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i].toLowerCase();
      const chosungToken = extractChosung(token);

      matchingEntries = matchingEntries.filter(
        (entry) =>
          entry.toLowerCase().includes(token) ||
          extractChosung(entry).includes(chosungToken)
      );
    }

    return matchingEntries;
  }

  private parseInputToTokens(input: string): string[] {
    return input.split(/\s+/).filter((token) => token.trim() !== '');
  }
}
