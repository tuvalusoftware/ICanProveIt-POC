import { AxiosInstance } from 'axios';
import { Project } from '../models/project';
import createClient from '../utils/createClient';

class ProjectService {
	client: AxiosInstance;

	constructor() {
		this.client = createClient('projects');
	}

	async createProject(file: File) {
		const formData = new FormData();
		formData.append('file', file);

		return (await this.client.post('/', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})) as Project;
	}

	async getProjects() {
		return (await this.client.get('/')) as Project[];
	}

	async getProject(id: number) {
		return (await this.client.get(`/${id}`)) as Project;
	}

	async generateChapters(id: number) {
		return (await this.client.post(`/${id}/chapters/generate`)) as Project;
	}

	getPdfUrl(id: number) {
		return `${this.client.defaults.baseURL}/${id}/pdf`;
	}
}

export default new ProjectService() as ProjectService;
