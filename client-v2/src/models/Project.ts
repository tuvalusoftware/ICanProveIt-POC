import { Base } from './Base';
import { Page } from './Page';
import { Question } from './Question';

export type Project = Base & {
	title: string;
	filepath: string;

	pages: Page[];
	questions: Question[];
};
