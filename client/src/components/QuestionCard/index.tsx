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
				type='inner'
				title={
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<h3>Question {order}</h3>
						<Space.Compact>
							<Button icon={<InfoCircleOutlined />} size='small' onClick={() => setIsShowContext(true)}>
								Show context
							</Button>

							<Button
								type='primary'
								icon={<PlayCircleOutlined />}
								loading={isGeneratingAnswer}
								size='small'
								onClick={handleGetAnswer}
							>
								Get answer
							</Button>
						</Space.Compact>
					</Space>
				}
				size='small'
			>
				<div style={{ marginBottom: 10 }}>{question}</div>

				{answer && <Alert showIcon type='info' message={answer} />}
			</Card>

			<Modal
				title={`Context ${order}`}
				open={isShowContext}
				okButtonProps={{ style: { display: 'none' } }}
				cancelButtonProps={{ style: { display: 'none' } }}
				centered
				onCancel={() => setIsShowContext(false)}
			>
				{context}
			</Modal>
		</>
	);
}
