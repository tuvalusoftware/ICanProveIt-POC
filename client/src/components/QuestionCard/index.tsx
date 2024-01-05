/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfoCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Modal, Space, message } from 'antd';
import { useCallback, useState } from 'react';
import generateService from '../../services/generate.service';

export type QuestionCardProps = {
	question: string;
	context: string;
	order: number;
};

export default function QuestionCard({ context, question, order }: QuestionCardProps) {
	const [isShowContext, setIsShowContext] = useState(false);
	const [answer, setAnswer] = useState('');
	const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

	const handleGetAnswer = useCallback(async () => {
		try {
			setIsGeneratingAnswer(true);
			const { answer } = await generateService.generateAnswer({ context, question });

			setAnswer(answer);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsGeneratingAnswer(false);
		}
	}, [question, context]);

	return (
		<>
			<Card
				title={
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<h3>Question {order}</h3>
						<Space>
							<Button type='link' icon={<InfoCircleOutlined />} onClick={() => setIsShowContext(true)}>
								Show context
							</Button>

							<Button
								type='primary'
								icon={<PlayCircleOutlined />}
								loading={isGeneratingAnswer}
								onClick={handleGetAnswer}
							>
								Get answer
							</Button>
						</Space>
					</Space>
				}
				size='small'
			>
				{question}

				{answer && <Alert type='success' message={answer} />}
			</Card>

			<Modal
				title={`Context ${order}`}
				open={isShowContext}
				okButtonProps={{ style: { display: 'none' } }}
				onCancel={() => setIsShowContext(false)}
			>
				{context}
			</Modal>
		</>
	);
}
