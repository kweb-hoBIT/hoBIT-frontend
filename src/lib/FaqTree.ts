import { Faq } from '../types/faq';

export interface Category {
	category_ko: string;
	category_en: string;
}

export class FaqTree {
	public tree: Map<Category, Map<Category, Faq[]>>;

	constructor(faqs: Faq[]) {
		this.tree = new Map();
		this.initializeTree(faqs);
	}

	private initializeTree(faqs: Faq[]) {
		faqs.forEach((faq) => {
			this.addToTree(
				{ category_ko: faq.maincategory_ko, category_en: faq.maincategory_en },
				{ category_ko: faq.subcategory_ko, category_en: faq.subcategory_en },
				faq
			);
		});
	}

	private addToTree(mainCategory: Category, subCategory: Category, faq: Faq) {
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

		const list = subCategoryMap.get(existingSubCategory || subCategory)!;
		list.push(faq);

		list.sort((a, b) => Number(a.category_order) - Number(b.category_order));
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
