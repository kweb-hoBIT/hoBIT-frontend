import { TrieNode } from './TrieNode';

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;

    for (const char of word) {
      const lowerChar = char.toLowerCase();
      if (!current.children.has(lowerChar)) {
        current.children.set(lowerChar, new TrieNode());
      }
      current = current.children.get(lowerChar)!;
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
    const node = this.find(input);
    if (node) {
      this.collectAllWordsIncluding(node, '', suggestions);
    }
    return suggestions;
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

  getSuggestionsByTokens(input: string): string[] {
    const tokens = this.parseInputToTokens(input);
    if (tokens.length === 0) return [];

    let matchingEntries = this.getSuggestionsIncluding(tokens[0]);

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i].toLowerCase();
      matchingEntries = matchingEntries.filter((entry) =>
        entry.toLowerCase().includes(token)
      );
    }

    return matchingEntries;
  }

  private parseInputToTokens(input: string): string[] {
    return input.split(/\s+/).filter((token) => token.trim() !== '');
  }
}
