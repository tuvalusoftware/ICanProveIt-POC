/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button, Col, Empty, Row, Select, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import projectService from '../../../services/project.service';
import questionService from '../../../services/question.service';
import styles from './index.module.scss';
import QuestionCard from '../../../components/QuestionCard';

type FilterType = 'all' | 'easy' | 'medium' | 'hard';

export default function ProjectPage() {
	const defaultLayoutPluginInstance = defaultLayoutPlugin();

	const { id } = useParams<{ id: string }>();
	const [isRequesting, setIsRequesting] = useState(false);

	const {
		data: project,
		isLoading: isLoadingProject,
		refetch: refetchProject,
	} = useQuery(['project', id], () => projectService.getProject(+id!));

	const { data: questions, isLoading: isLoadingQuestions } = useQuery(['questions', { projectId: +id! }], () =>
		questionService.getQuestionsByProjectId(+id!),
	);

	const handleGenerateQuestions = async () => {
		try {
			setIsRequesting(true);
			await questionService.generateQuestions(+id!);
			message.success('Questions is generating');
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsRequesting(false);
			refetchProject();
		}
	};

	const [filter, setFilter] = useState<FilterType>('all');

	const filteredQuestions = useMemo(() => {
		if (!questions) return [];
		if (filter === 'all') return questions;
		return questions.filter((question) => question.level === filter);
	}, [filter, questions]);

	return (
		<div className={styles.wrapper}>
			{isLoadingProject && <Loader />}

			{project && (
				<Row>
					<Col span={24} lg={12} style={{ padding: 10 }}>
						<Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
							<div className={styles.pdfWrapper}>
								<Viewer
									key={project.id}
									fileUrl={projectService.getPdfUrl(project.id)}
									renderLoader={() => <Loader />}
									plugins={[defaultLayoutPluginInstance]}
									onDocumentAskPassword={() => {
										// eslint-disable-next-line no-alert
										const password = window.prompt('Password?');
										return password;
									}}
								/>
							</div>
						</Worker>
					</Col>

					<Col span={24} lg={12} style={{ padding: 10 }}>
						<Typography.Title level={2}>{project.title}</Typography.Title>

						{isLoadingQuestions && <Loader />}

						{questions && (
							<>
								{!questions.length ? (
									<Empty>
										<Button
											type='primary'
											icon={<QuestionCircleOutlined />}
											onClick={handleGenerateQuestions}
											disabled={project.in_ocr_process}
										>
											{project.in_ocr_process
												? 'Document is in OCR process'
												: 'Generate questions'}
										</Button>
									</Empty>
								) : (
									<Space direction='vertical' style={{ width: '100%' }}>
										<Select<FilterType> value={filter} style={{ width: 200 }} onSelect={setFilter}>
											<Select.Option key='all'>All</Select.Option>
											<Select.Option key='easy'>Easy</Select.Option>
											<Select.Option key='medium'>Medium</Select.Option>
											<Select.Option key='hard'>Hard</Select.Option>
										</Select>

										{filteredQuestions.map((question) => (
											<QuestionCard question={question} key={question.id} />
										))}
									</Space>
								)}
							</>
						)}

						{project.in_question_process && <Loader message='Generating question' />}

						{questions?.length && !project.in_question_process ? (
							<Button
								loading={isRequesting}
								type='primary'
								icon={<QuestionCircleOutlined />}
								disabled={project.in_ocr_process}
								onClick={handleGenerateQuestions}
							>
								{project.in_ocr_process ? 'Document is in OCR process' : 'Generate more'}
							</Button>
						) : (
							<></>
						)}
					</Col>
				</Row>
			)}
		</div>
	);
}
