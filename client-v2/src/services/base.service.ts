import { AxiosInstance } from 'axios';
import createClient from '../utils/createClient';

/**
 * BaseService is a base class for all service classes.
 */
class BaseService {
	protected readonly client: AxiosInstance; // Axios client instance.

	/**
	 * @param resource - Resource name of the service.
	 */
	constructor(resource: string) {
		this.client = createClient(resource);
	}
}

export default BaseService;
