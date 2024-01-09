import { Question } from './question';

export type Chapter = {
	id: number;
	title: string;
	first_page: number;
	last_page: number;

	project_id: number;

	questions: Question[];
};
