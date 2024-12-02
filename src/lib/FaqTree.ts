import { Faq } from '../types/faq';

interface IFaqTree {
  [mainCategory: string]: {
    [subCategory: string]: Faq[];
  };
}

export class FaqTree {
  public tree: IFaqTree;

  constructor(faqs: Faq[]) {
    this.tree = {};
    this.initializeTree(faqs);
  }

  private initializeTree(faqs: Faq[]) {
    faqs.forEach((faq) => {
      this.addToTree(faq.maincategory_ko, faq.subcategory_ko, faq);
    });
  }

  private addToTree(mainCategory: string, subCategory: string, faq: Faq) {
    if (!this.tree[mainCategory]) {
      this.tree[mainCategory] = {};
    }

    if (!this.tree[mainCategory][subCategory]) {
      this.tree[mainCategory][subCategory] = [];
    }

    this.tree[mainCategory][subCategory].push(faq);
  }
}
