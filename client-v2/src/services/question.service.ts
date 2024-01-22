import { Question } from '../models/Question';
import BaseService from './base.service';

export type GenQuestionReq = {
	firstPage: number;
	lastPage: number;
};

/**
 * QuestionService is a class for making HTTP requests to the questions resource
 */
class QuestionService extends BaseService {
	constructor() {
		super('questions');
	}

	/**
	 * generateQuestions is a method for making a POST request to the questions resource
	 * @param projectId - The ID of the project to generate questions for a project
	 * @returns A promise that resolves to an array of questions
	 */
	async generateQuestions(projectId: number, options: GenQuestionReq): Promise<Question[]> {
		return await this.client.post(
			'',
			{
				first_page: options.firstPage,
				last_page: options.lastPage,
			},
			{
				params: {
					project_id: projectId,
				},
			},
		);
	}

	/**
	 * getQuestionsByProjectId is a method for making a GET request to the questions resource
	 * @param projectId - The ID of the project to get questions for a project
	 * @returns A promise that resolves to an array of questions
	 */
	async getQuestionsByProjectId(projectId: number): Promise<Question[]> {
		return await this.client.get('', {
			params: {
				project_id: projectId,
			},
		});
	}

	/**
	 * getAllQuestions is a method for making a GET request to the questions resource
	 * @returns A promise that resolves to an array of questions
	 */
	async getAllQuestions(): Promise<Question[]> {
		return await this.client.get('');
	}
}

export default new QuestionService() as QuestionService;
