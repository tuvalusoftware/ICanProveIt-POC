import { AxiosInstance } from 'axios';
import QuestionAndContext from '../models/questionAndContext';
import createClient from '../utils/createClient';

export type PdfToQuestionRes = {
	questions: QuestionAndContext[];
	time: number;
};

export type GenerateAnswerRes = {
	answer: string;
};

class GenerateService {
	private client: AxiosInstance;

	constructor() {
		this.client = createClient('generate');
	}

	async pdfToQuestions(file: File) {
		const form = new FormData();
		form.append('file', file);

		return (await this.client.postForm('/pdf-to-questions', form, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})) as PdfToQuestionRes;
	}

	async generateAnswer(question: QuestionAndContext) {
		return (await this.client.post('/answer', question)) as GenerateAnswerRes;
	}
}

export default new GenerateService() as GenerateService;
