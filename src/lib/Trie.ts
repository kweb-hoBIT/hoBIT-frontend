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

  getSuggestions(prefix: string): string[] {
    const node = this.find(prefix);
    const suggestions: string[] = [];

    if (node) {
      this.collectAllWords(node, prefix, suggestions);
    }

    return suggestions;
  }

  private collectAllWords(
    node: TrieNode,
    prefix: string,
    suggestions: string[]
  ): void {
    if (node.isEndOfWord) suggestions.push(prefix);

    for (const [char, childNode] of node.children) {
      this.collectAllWords(childNode, prefix + char, suggestions);
    }
  }
}
