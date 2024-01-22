import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Descriptions,
	Divider,
	Modal,
	Popconfirm,
	Space,
	Tag,
	Tooltip,
	Typography,
	message,
	theme,
} from 'antd';
import markdownit from 'markdown-it';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Question, QuestionLevel } from '../../models/Question';
import queryClient from '../../queryClient';
import pageService from '../../services/page.service';
import questionService from '../../services/question.service';
import Loader from '../Loader';

const md = markdownit();

export type QuestionCardProps = {
	question: Question;
};

function renderLevel(level: QuestionLevel) {
	return <Tag color={level === 'easy' ? 'green' : level === 'medium' ? 'orange' : 'red'}>{level}</Tag>;
}

export default function QuestionCard({ question }: QuestionCardProps) {
	const token = theme.useToken();

	const { data: page, isLoading: isLoadingPage } = useQuery(['page', question.page_id], () =>
		pageService.getPage(question.page_id),
	);

	const pageContentHtml = md.render(page?.content || '');

	const [isOpenContext, setIsOpenContext] = useState(false);

	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteQuestion = async () => {
		try {
			setIsDeleting(true);
			await questionService.deleteQuestion(question.id);
			queryClient.setQueryData(['questions', { projectId: question.project_id }], (old: any) =>
				old.filter((q: any) => q.id !== question.id),
			);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<Card type='inner' style={{ marginBottom: 10, border: `1px solid ${token.token.colorPrimary}` }}>
				<div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
					{renderLevel(question.level)}
					<Typography style={{ fontWeight: 700, flex: 1 }}>{question.question}</Typography>
					<Space>
						<Popconfirm
							title='Delte question'
							description='Do you want delete this question'
							okButtonProps={{
								danger: true,
								loading: isDeleting,
							}}
							onConfirm={handleDeleteQuestion}
						>
							<Tooltip title='Delete'>
								<Button icon={<DeleteOutlined />} danger type='primary' shape='circle'></Button>
							</Tooltip>
						</Popconfirm>

						<Tooltip title='Show context'>
							<Button
								icon={<FileTextOutlined />}
								shape='circle'
								type='primary'
								onClick={() => setIsOpenContext(true)}
							/>
						</Tooltip>
					</Space>
				</div>

				<Divider />

				<div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
					{question.answers.map((answer) => (
						<Checkbox key={answer.id} checked={answer.is_true}>
							{answer.answer}
						</Checkbox>
					))}
				</div>
			</Card>

			<Modal
				open={isOpenContext}
				width={800}
				destroyOnClose
				title={`Context of ${question.question}`}
				onCancel={() => setIsOpenContext(false)}
				okButtonProps={{ hidden: true }}
			>
				{isLoadingPage || !page ? (
					<Loader />
				) : (
					<Descriptions
						column={1}
						items={[
							{ label: 'Question', children: question.question },
							{
								label: 'Answers',
								children: (
									<ul>
										{question.answers.map((answer) => (
											<li key={answer.id}>
												{answer.answer} ({answer.is_true ? 'True' : 'False'})
											</li>
										))}
									</ul>
								),
							},
							{
								label: 'Context',
								children: (
									<div
										style={{
											border: '1px solid #ddd',
											padding: 20,
											borderRadius: 10,
											background: '#f3f3f3',
										}}
										dangerouslySetInnerHTML={{ __html: pageContentHtml }}
									></div>
								),
							},
							{
								label: 'Page number',
								children: page.number,
							},
						]}
					/>
				)}
			</Modal>
		</>
	);
}
