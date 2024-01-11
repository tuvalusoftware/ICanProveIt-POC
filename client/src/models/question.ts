import { Answer } from './answer';

export type Question = {
	id: number;
	question: string;

	chapter_id: number;
	answers: Answer[];
};
