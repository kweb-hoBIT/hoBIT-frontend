export class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  originalWord: string;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.originalWord = '';
  }
}
