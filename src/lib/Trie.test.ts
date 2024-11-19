import { Trie } from './Trie';

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
    trie.insert('apple');
    trie.insert('app');
    trie.insert('apricot');
    trie.insert('banana');
  });

  it('should return suggestions for prefix "app"', () => {
    const suggestions = trie.getSuggestions('app');
    expect(suggestions).toEqual(['apple', 'app']);
  });

  it('should return suggestions for prefix "ap"', () => {
    const suggestions = trie.getSuggestions('ap');
    expect(suggestions).toEqual(['apple', 'app', 'apricot']);
  });

  it('should return suggestions for prefix "ba"', () => {
    const suggestions = trie.getSuggestions('ba');
    expect(suggestions).toEqual(['banana']);
  });

  it('should return an empty array for prefix "xyz"', () => {
    const suggestions = trie.getSuggestions('xyz');
    expect(suggestions).toEqual([]);
  });

  it('should return an empty array for an empty Trie', () => {
    const emptyTrie = new Trie();
    const suggestions = emptyTrie.getSuggestions('any');
    expect(suggestions).toEqual([]);
  });
});
