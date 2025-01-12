import { SeniorFAQ } from '../types/faq';

export interface Category {
  category_ko: string;
  category_en: string;
}

export class SeniorFaqTree {
  public tree: Map<Category, Map<Category, SeniorFAQ[]>>;

  constructor(faqs: SeniorFAQ[]) {
    this.tree = new Map();
    this.initializeTree(faqs);
  }

  private initializeTree(faqs: SeniorFAQ[]) {
    faqs.forEach((faq) => {
      this.addToTree(
        { category_ko: faq.maincategory_ko, category_en: faq.maincategory_en },
        { category_ko: faq.subcategory_ko, category_en: faq.subcategory_en },
        faq
      );
    });
  }

  private addToTree(
    mainCategory: Category,
    subCategory: Category,
    faq: SeniorFAQ
  ) {
    const existingMainCategory = this.findCategoryByKo(
      this.tree.keys(),
      mainCategory.category_ko
    );

    if (!existingMainCategory) {
      this.tree.set(mainCategory, new Map());
    }

    const subCategoryMap = this.tree.get(existingMainCategory || mainCategory)!;

    const existingSubCategory = this.findCategoryByKo(
      subCategoryMap.keys(),
      subCategory.category_ko
    );

    if (!existingSubCategory) {
      subCategoryMap.set(subCategory, []);
    }

    subCategoryMap.get(existingSubCategory || subCategory)!.push(faq);
  }

  private findCategoryByKo(
    keys: Iterable<Category>,
    targetKo: string
  ): Category | undefined {
    for (const key of keys) {
      if (key.category_ko === targetKo) {
        return key;
      }
    }
    return undefined;
  }
}
