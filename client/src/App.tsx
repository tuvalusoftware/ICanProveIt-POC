/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseCircleOutlined, FileOutlined } from '@ant-design/icons';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button, Col, Modal, Row, Space, Spin, message } from 'antd';
import { useCallback, useState } from 'react';
import styles from './App.module.scss';
import QuestionCard from './components/QuestionCard';
import UploadPdfFile from './components/UploadPdfFile';
import QuestionAndContext from './models/questionAndContext';
import generateService from './services/generate.service';
import pdfService from './services/pdf.service';

function App() {
	const [fileBlob, setFileBlob] = useState<string>();
	const [questions, setQuestions] = useState<QuestionAndContext[]>([]);
	const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
	const [documentText, setDocumentText] = useState('');
	const [isShowDocumentText, setIsShowDocumentText] = useState(false);

	const [parent] = useAutoAnimate();

	const handleUpload = useCallback(
		async (file: File) => {
			fileBlob && URL.revokeObjectURL(fileBlob);

			const blob = URL.createObjectURL(file);

			setFileBlob(blob);

			try {
				setIsGeneratingQuestions(true);
				const { text } = await pdfService.pdfToText(file);
				const { questions } = await generateService.pdfToQuestions(file);

				setQuestions(questions);
				setDocumentText(text);
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsGeneratingQuestions(false);
			}
		},
		[fileBlob],
	);

	return (
		<Row className={styles.wrapper} ref={parent}>
			<Col xs={24} lg={12} style={{ padding: 10 }}>
				{fileBlob ? (
					<div className={styles.previewWrapper}>
						<Space.Compact>
							<Button icon={<FileOutlined />} onClick={() => setIsShowDocumentText(true)}>
								Show text
							</Button>

							<Button
								icon={<CloseCircleOutlined />}
								onClick={() => {
									setFileBlob(undefined);
									setQuestions([]);
								}}
							></Button>
						</Space.Compact>

						<iframe className={styles.preview} src={fileBlob}></iframe>
					</div>
				) : (
					<UploadPdfFile onUpload={handleUpload} />
				)}
			</Col>

			<Col xs={24} lg={12} style={{ padding: 10 }}>
				{isGeneratingQuestions && <Spin />}

				<Space direction='vertical' style={{ width: '100%' }}>
					{questions.map((question, index) => (
						<QuestionCard
							key={index}
							order={index + 1}
							context={question.context}
							question={question.question}
						/>
					))}
				</Space>
			</Col>

			<Modal open={isShowDocumentText} title='Document text' onCancel={() => setIsShowDocumentText(false)}>
				{documentText}
			</Modal>
		</Row>
	);
}

export default App;
