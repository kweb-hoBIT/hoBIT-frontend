import { TrieNode } from './TrieNode';

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;

    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
  }

  find(prefix: string): TrieNode | null {
    let current = this.root;

    for (const char of prefix) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }

    return current;
  }

  getSuggestionsIncluding(input: string): string[] {
    const suggestions: string[] = [];
    this.collectAllWordsIncluding(this.root, '', input, suggestions);
    return suggestions;
  }

  private collectAllWordsIncluding(
    node: TrieNode,
    currentWord: string,
    input: string,
    suggestions: string[]
  ): void {
    if (node.isEndOfWord && currentWord.includes(input)) {
      suggestions.push(currentWord);
    }

    for (const [char, childNode] of node.children) {
      this.collectAllWordsIncluding(
        childNode,
        currentWord + char,
        input,
        suggestions
      );
    }
  }

  getSuggestionsByTokens(input: string): string[] {
    const tokens = this.parseInputToTokens(input);
    if (tokens.length === 0) return [];

    let matchingEntries = this.getSuggestionsIncluding(tokens[0]);

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      matchingEntries = matchingEntries.filter((entry) =>
        entry.includes(token)
      );
    }

    return matchingEntries;
  }

  private parseInputToTokens(input: string): string[] {
    return input.split(/\s+/).filter((token) => token.trim() !== '');
  }
}
