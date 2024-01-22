import { Answer } from './Answer';
import { Base } from './Base';

export type QuestionLevel = 'easy' | 'medium' | 'hard';

export type Question = Base & {
	question: string;
	level: QuestionLevel;

	page_id: number;
	answers: Answer[];
};
