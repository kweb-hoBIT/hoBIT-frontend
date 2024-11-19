import { Node } from './TrieNode';

export class Trie {
  root: Node;

  constructor() {
    this.root = new Node('', '');
  }

  insert(word: string): void {
    let curNode = this.root;
    word.split('').forEach((w, i) => {
      const isFinalChar = i === word.length - 1;
      const hasNode = curNode.children[w];
      if (hasNode) {
        curNode = hasNode;
      } else {
        const newNode = new Node('', w);
        curNode.children[w] = newNode;
        curNode = newNode;
      }
      if (isFinalChar) {
        curNode.val = word;
      }
    });
  }

  search(word: string): boolean {
    let curNode = this.root;
    const array = word.split('');
    let i = 0;
    while (i < array.length) {
      const w = array[i];
      curNode = curNode.children[w];
      if (curNode === undefined) {
        return false;
      }
      i++;
    }
    return curNode ? curNode.val === word : false;
  }

  startsWith(prefix: string): boolean {
    let curNode = this.root;
    const array = prefix.split('');
    let i = 0;
    while (i < array.length) {
      const w = array[i];
      curNode = curNode.children[w];
      if (curNode === undefined) {
        return false;
      }
      i++;
    }
    return curNode
      ? curNode.val === prefix || Object.keys(curNode.children).length > 0
      : false;
  }

  getSuggestions(prefix: string): string[] {
    let curNode = this.root;
    const array = prefix.split('');
    const suggestions: string[] = [];

    for (const char of array) {
      curNode = curNode.children[char];
      if (!curNode) {
        return suggestions;
      }
    }

    this.collectWords(curNode, suggestions);
    return suggestions;
  }

  private collectWords(node: Node, suggestions: string[]): void {
    if (node.val) {
      suggestions.push(node.val);
    }
    for (const child in node.children) {
      this.collectWords(node.children[child], suggestions);
    }
  }
}
