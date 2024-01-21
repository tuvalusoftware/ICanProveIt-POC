/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button, Col, Empty, Row, Tabs, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import QuestionCard from '../../../components/QuestionCard';
import projectService from '../../../services/project.service';
import questionService from '../../../services/question.service';
import styles from './index.module.scss';

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

	const easyQuestions = useMemo(() => questions?.filter((q) => q.level === 'easy') || [], [questions]);
	const mediumQuestions = useMemo(() => questions?.filter((q) => q.level === 'medium') || [], [questions]);
	const hardQuestions = useMemo(() => questions?.filter((q) => q.level === 'hard') || [], [questions]);

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
										>
											Generate questions
										</Button>
									</Empty>
								) : (
									<>
										<Tabs
											tabBarStyle={{
												position: 'sticky',
												top: 76,
												zIndex: 10,
												background: '#fff',
											}}
											type='card'
											items={[
												{
													label: 'All',
													key: 'all',
													children: questions ? (
														questions.map((question) => (
															<QuestionCard key={question.id} question={question} />
														))
													) : (
														<Empty />
													),
													icon: <FileOutlined />,
												},
												{
													label: 'Easy',
													key: 'easy',
													children: easyQuestions.length ? (
														easyQuestions.map((question) => (
															<QuestionCard key={question.id} question={question} />
														))
													) : (
														<Empty />
													),
												},
												{
													label: 'Medium',
													key: 'medium',
													children: mediumQuestions.length ? (
														mediumQuestions.map((question) => (
															<QuestionCard key={question.id} question={question} />
														))
													) : (
														<Empty />
													),
												},
												{
													label: 'Hard',
													key: 'hard',
													children: hardQuestions.length ? (
														hardQuestions.map((question) => (
															<QuestionCard key={question.id} question={question} />
														))
													) : (
														<Empty />
													),
												},
											]}
										/>
									</>
								)}
							</>
						)}

						{project.in_question_process && <Loader message='Generating question' />}

						{questions?.length && !project.in_question_process ? (
							<Button
								loading={isRequesting}
								type='primary'
								icon={<QuestionCircleOutlined />}
								onClick={handleGenerateQuestions}
							>
								Generate more
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
