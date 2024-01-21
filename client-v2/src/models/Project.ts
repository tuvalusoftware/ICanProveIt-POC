import { Base } from './Base';
import { Page } from './Page';
import { Question } from './Question';

export type Project = Base & {
	title: string;
	filepath: string;
	in_ocr_process: boolean;
	in_question_process: boolean;

	pages: Page[];
	questions: Question[];
};
