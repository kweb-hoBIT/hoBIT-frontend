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
		const sortedFaqs = [...faqs].sort((a, b) => {
			const orderA = parseInt(a.category_order);
			const orderB = parseInt(b.category_order);
			return orderA - orderB;
		});

		sortedFaqs.forEach((faq) => {
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

		const mainKey = existingMainCategory || mainCategory;

		if (!this.tree.has(mainKey)) {
			this.tree.set(mainKey, new Map());
		}

		const subCategoryMap = this.tree.get(mainKey)!;

		const existingSubCategory = this.findCategoryByKo(
			subCategoryMap.keys(),
			subCategory.category_ko
		);

		const subKey = existingSubCategory || subCategory;

		if (!subCategoryMap.has(subKey)) {
			subCategoryMap.set(subKey, []);
		}

		subCategoryMap.get(subKey)!.push(faq);
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
