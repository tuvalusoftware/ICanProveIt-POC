import { Project } from '../models/Project';
import BaseService from './base.service';

/**
 * ProjectService is a service class for Project model.
 */
class ProjectService extends BaseService {
	constructor() {
		super('projects');
	}

	/**
	 * Create a project.
	 * @param file - File to upload.
	 * @param useOcr - Whether to use OCR or not.
	 * @returns Project object.
	 */
	async createProject(file: File, useOcr: boolean = false): Promise<Project> {
		const formData = new FormData();
		formData.append('file', file);

		return await this.client.post('/', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			params: {
				use_ocr: useOcr,
			},
		});
	}

	/**
	 * Get all projects.
	 * @returns List of projects.
	 */
	async getProjects(): Promise<Project[]> {
		return await this.client.get('/');
	}

	/**
	 * Get a project by id.
	 * @param id - Id of the project.
	 * @returns - Project object.
	 */
	async getProject(id: number): Promise<Project> {
		return await this.client.get(`/${id}`);
	}

	/**
	 * Delete a project by id.
	 * @param id - Id of the project.
	 */
	async deleteProject(id: number): Promise<void> {
		return await this.client.delete(`/${id}`);
	}

	/**
	 * Get url of the pdf file.
	 * @param id - Id of the project.
	 * @returns - Url of the pdf file.
	 */
	getPdfUrl(id: number): string {
		return `${this.client.defaults.baseURL}/${id}/pdf`;
	}
}

export default new ProjectService() as ProjectService;
