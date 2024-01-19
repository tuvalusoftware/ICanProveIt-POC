import { AxiosInstance } from 'axios';
import { Question } from '../models/Question';
import createClient from '../utils/createClient';

/**
 * QuestionService is a class for making HTTP requests to the questions resource
 */
class QuestionService {
	private readonly resource: string = 'questions';
	private readonly client: AxiosInstance;

	constructor() {
		this.client = createClient(this.resource); // createClient('questions')
	}

	/**
	 * generateQuestions is a method for making a POST request to the questions resource
	 * @param projectId - The ID of the project to generate questions for a project
	 * @returns A promise that resolves to an array of questions
	 */
	async generateQuestions(projectId: number): Promise<Question[]> {
		return await this.client.post('', null, {
			params: {
				project_id: projectId,
			},
		});
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
