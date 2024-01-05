import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

export default function createClient(baseURL: string = '') {
	const client = axios.create({
		baseURL: `${API_URL}/${baseURL}`,
	});

	client.interceptors.response.use(
		(res) => res.data,
		(error) => (error.response?.data ? { message: error.response.data.detail } : error),
	);

	return client;
}
