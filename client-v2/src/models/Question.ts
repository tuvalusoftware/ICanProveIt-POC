import { Answer } from './Answer';
import { Base } from './Base';

export type Question = Base & {
	question: string;
	level: 'easy' | 'medium' | 'hard';

	page_id: number;
	answers: Answer[];
};
