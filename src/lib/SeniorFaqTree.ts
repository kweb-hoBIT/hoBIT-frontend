import { seniorFaqs } from '../types/faq';

export type SeniorFaqTree = {
  [mainCategory: string]: {
    [subCategory: string]: {
      [detailCategory: string]: any[];
    };
  };
};

export const buildSeniorFaqTree = (faqs: typeof seniorFaqs): SeniorFaqTree => {
  const tree: SeniorFaqTree = {};

  faqs.forEach((faq) => {
    const {
      maincategory_ko,
      subcategory_ko,
      detailcategory_ko,
      answer_ko,
      senior_faq_id,
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
      senior_faq_id,
      answer_ko,
    });
  });

  return tree;
};

const seniorFaqTree = buildSeniorFaqTree(seniorFaqs);
