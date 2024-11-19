export class Node {
  children: Record<string, Node>;
  val: string;
  char: string;

  constructor(val = '', char = '') {
    this.val = val;
    this.children = {};
    this.char = char;
  }
}
