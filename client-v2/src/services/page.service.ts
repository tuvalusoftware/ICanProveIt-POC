import { AxiosInstance } from 'axios';
import createClient from '../utils/createClient';
import { Page } from '../models/Page';

class PageService {
	private readonly resource: string = 'pages';
	private readonly client: AxiosInstance;

	constructor() {
		this.client = createClient(this.resource);
	}

	async getAllPages(): Promise<Page[]> {
		return await this.client.get('');
	}

	async getPage(pageId: number): Promise<Page> {
		return await this.client.get(`${pageId}`);
	}
}

export default new PageService() as PageService;
