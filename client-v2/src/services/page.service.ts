import { Page } from '../models/Page';
import BaseService from './base.service';

/**
 * PageService is a service class for Page model.
 */
class PageService extends BaseService {
	constructor() {
		super('pages');
	}

	/**
	 * Get all pages.
	 * @returns {Promise<Page[]>} List of pages.
	 */
	async getAllPages(): Promise<Page[]> {
		return await this.client.get('');
	}

	/**
	 * Get a page by id.
	 * @param {number} pageId Id of the page.
	 * @returns {Promise<Page>} Page object.
	 */
	async getPage(pageId: number): Promise<Page> {
		return await this.client.get(`${pageId}`);
	}
}

export default new PageService() as PageService;
