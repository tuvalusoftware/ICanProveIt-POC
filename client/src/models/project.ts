import { Chapter } from './chapter';

export type Project = {
	id: number;
	title: string;

	chapters: Chapter[];
};
