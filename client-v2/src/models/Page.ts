import { Base } from './Base';
import { Question } from './Question';

export type Page = Base & {
	number: number;
	content: string;
	project_id: number;

	questions: Question[];
};
