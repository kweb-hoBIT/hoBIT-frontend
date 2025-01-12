import { SeniorFAQ } from '../types/faq';

export type SeniorFaqTree = {
  [mainCategory: string]: {
    [subCategory: string]: {
      [detailCategory: string]: any[];
    };
  };
};

export const buildSeniorFaqTree = (faqs: SeniorFAQ[]): SeniorFaqTree => {
  const tree: SeniorFaqTree = {};

  faqs.forEach((faq: SeniorFAQ) => {
    const {
      id,
      maincategory_ko,
      subcategory_ko,
      detailcategory_ko,
      answer_ko,
    } = faq;

    if (!tree[maincategory_ko]) {
      tree[maincategory_ko] = {};
    }

    if (!tree[maincategory_ko][subcategory_ko]) {
      tree[maincategory_ko][subcategory_ko] = {};
    }

    const detailKey = detailcategory_ko || 'default';
    if (!tree[maincategory_ko][subcategory_ko][detailKey]) {
      tree[maincategory_ko][subcategory_ko][detailKey] = [];
    }

    tree[maincategory_ko][subcategory_ko][detailKey].push({
      id,
      answer_ko,
    });
  });

  return tree;
};
