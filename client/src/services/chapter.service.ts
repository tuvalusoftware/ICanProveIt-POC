import { AxiosInstance } from 'axios';
import createClient from '../utils/createClient';
import { Chapter } from '../models/chapter';

class ChapterService {
	private client: AxiosInstance;

	constructor() {
		this.client = createClient('chapters');
	}

	async generateQuestions(chapterId: number) {
		return (await this.client.post(`/${chapterId}/questions/generate`)) as Chapter;
	}
}

export default new ChapterService() as ChapterService;
