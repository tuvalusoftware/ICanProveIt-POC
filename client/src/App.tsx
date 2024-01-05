/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseCircleOutlined } from '@ant-design/icons';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button, Space, Spin, message } from 'antd';
import { useCallback, useState } from 'react';
import styles from './App.module.scss';
import QuestionCard from './components/QuestionCard';
import UploadPdfFile from './components/UploadPdfFile';
import QuestionAndContext from './models/questionAndContext';
import generateService from './services/generate.service';

function App() {
	const [fileBlob, setFileBlob] = useState<string>();
	const [questions, setQuestions] = useState<QuestionAndContext[]>([]);
	const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

	const [parent] = useAutoAnimate();

	const handleUpload = useCallback(
		async (file: File) => {
			fileBlob && URL.revokeObjectURL(fileBlob);

			const blob = URL.createObjectURL(file);

			setFileBlob(blob);

			try {
				setIsGeneratingQuestions(true);
				const { questions } = await generateService.pdfToQuestions(file);

				setQuestions(questions);
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsGeneratingQuestions(false);
			}
		},
		[fileBlob],
	);

	return (
		<div className={styles.wrapper} ref={parent}>
			{fileBlob ? (
				<div>
					<iframe className={styles.preview} src={fileBlob}></iframe>
					<Button
						icon={<CloseCircleOutlined />}
						danger
						onClick={() => {
							setFileBlob(undefined);
							setQuestions([]);
						}}
					>
						Close
					</Button>
				</div>
			) : (
				<UploadPdfFile onUpload={handleUpload} />
			)}

			{isGeneratingQuestions && (
				<div className={styles.loading}>
					<Spin /> Generating questions...
				</div>
			)}

			<Space direction='vertical' style={{ width: '100%', margin: '10px 0' }}>
				{questions.map((question, index) => (
					<QuestionCard
						key={index}
						order={index + 1}
						context={question.context}
						question={question.question}
					/>
				))}
			</Space>
		</div>
	);
}

export default App;
