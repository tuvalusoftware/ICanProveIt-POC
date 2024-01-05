import { AxiosInstance } from 'axios';
import createClient from '../utils/createClient';

export type PdfToTextRes = {
	text: string;
};

class PdfService {
	private client: AxiosInstance;

	constructor() {
		this.client = createClient('pdf');
	}

	async pdfToText(file: File) {
		const form = new FormData();
		form.append('file', file);

		return (await this.client.post('to-text', form, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})) as PdfToTextRes;
	}
}

export default new PdfService() as PdfService;
