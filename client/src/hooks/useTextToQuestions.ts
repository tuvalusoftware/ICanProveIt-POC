import { useEffect, useState } from 'react';
import QuestionAndContext from '../models/questionAndContext';
import { message } from 'antd';
import generateService from '../services/generate.service';

export default function useTextToQuestions(text?: string) {
	const [questions, setQuestions] = useState<QuestionAndContext[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!text) {
			setQuestions([]);
			return;
		}

		(async () => {
			try {
				setIsLoading(true);
				setQuestions((await generateService.textToQuestions(text)).questions);
			} catch (error) {
				message.error((error as Error).message);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [text]);

	return { questions, isLoading };
}
