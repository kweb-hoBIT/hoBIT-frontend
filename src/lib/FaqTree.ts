import { hobitApi } from '../api/api';
import { Faq } from '../types/faq';

interface IFaqTree {
  [mainCategory: string]: {
    [subCategory: string]: Faq[];
  };
}

export class FaqTree {
  private tree: IFaqTree;

  constructor() {
    this.tree = {};
    this.initializeTree();
  }

  private async initializeTree() {
    const response = await hobitApi({ type: 'all_faqs' }, 'GET');
    if (response.error || !response.payload) {
      throw new Error('FAQ 데이터를 불러오는데 실패했습니다');
    }
    this.buildTree(response.payload.faqs);
  }

  private buildTree(faqs: Faq[]) {
    faqs.forEach((faq) => {
      const mainCategory = faq.maincategory_ko;
      const subCategory = faq.subcategory_ko;

      if (!this.tree[mainCategory]) {
        this.tree[mainCategory] = {};
      }

      if (!this.tree[mainCategory][subCategory]) {
        this.tree[mainCategory][subCategory] = [];
      }

      this.tree[mainCategory][subCategory].push(faq);
    });
  }
}
