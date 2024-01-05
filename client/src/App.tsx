/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloseCircleOutlined, FileOutlined } from '@ant-design/icons';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button, Col, Modal, Row, Space, Spin } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import styles from './App.module.scss';
import QuestionCard from './components/QuestionCard';
import UploadPdfFile from './components/UploadPdfFile';
import usePdfToText from './hooks/usePdfToText';
import useTextToQuestions from './hooks/useTextToQuestions';

let prevBlob = '';

function App() {
	const [file, setFile] = useState<File>();

	const [isShowDocumentText, setIsShowDocumentText] = useState(false);

	const [parent] = useAutoAnimate();

	const handleUpload = useCallback(async (file: File) => {
		setFile(file);
	}, []);

	const fileBlob = useMemo(() => {
		if (prevBlob) URL.revokeObjectURL(prevBlob);
		if (!file) return '';

		prevBlob = URL.createObjectURL(file);
		return prevBlob;
	}, [file]);

	const { text: documentText, isLoading: isLoadingText } = usePdfToText(file);
	const { questions, isLoading: isLoadingQuestions } = useTextToQuestions(documentText);

	return (
		<Row className={styles.wrapper} ref={parent}>
			<Col xs={24} lg={12} style={{ padding: 10 }}>
				{fileBlob ? (
					<div className={styles.previewWrapper}>
						<Space.Compact>
							<Button
								icon={<FileOutlined />}
								loading={isLoadingText}
								onClick={() => setIsShowDocumentText(true)}
							>
								Show text
							</Button>

							<Button icon={<CloseCircleOutlined />} onClick={() => setFile(undefined)}></Button>
						</Space.Compact>

						<iframe className={styles.preview} src={fileBlob}></iframe>
					</div>
				) : (
					<UploadPdfFile onUpload={handleUpload} />
				)}
			</Col>

			<Col xs={24} lg={12} style={{ padding: 10 }}>
				{isLoadingQuestions && <Spin />}

				<Space direction='vertical' className={styles.questionsWrapper}>
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
