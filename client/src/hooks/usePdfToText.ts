import { message } from 'antd';
import { useEffect, useState } from 'react';
import pdfService from '../services/pdf.service';

export default function usePdfToText(file?: File) {
	const [text, setText] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!file) {
			setText('');
			return;
		}

		(async () => {
			try {
				setIsLoading(true);
				setText(await pdfService.pdfToText(file).then((res) => res.text));
			} catch (error) {
				message.error((error as Error).message);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [file]);

	return { text, isLoading };
}
