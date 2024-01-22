/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Alert, Button, Col, Descriptions, Empty, Modal, Row, Select, Slider, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import QuestionCard from '../../../components/QuestionCard';
import { QuestionLevel } from '../../../models/Question';
import projectService from '../../../services/project.service';
import questionService from '../../../services/question.service';
import styles from './index.module.scss';

type FilterType = 'all' | QuestionLevel;

const MAX_PAGE_PER_GEN = 5;

export default function ProjectPage() {
	const defaultLayoutPluginInstance = defaultLayoutPlugin();

	const { id } = useParams<{ id: string }>();
	const [isRequesting, setIsRequesting] = useState(false);

	const {
		data: project,
		isLoading: isLoadingProject,
		refetch: refetchProject,
	} = useQuery(['project', id], () => projectService.getProject(+id!), {
		onError(error: Error) {
			message.error(error.message);
		},
	});

	const {
		data: questions,
		isLoading: isLoadingQuestions,
		isRefetching: isQuestionsRefetching,
		refetch: refetchQuestions,
	} = useQuery(['questions', { projectId: +id! }], () => questionService.getQuestionsByProjectId(+id!), {
		onError(error: Error) {
			message.error(error.message);
		},
	});

	const [isOpenGenerateModal, setIsOpenGenerateModal] = useState(false);
	const [firstPage, setFirstPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);

	const handleGenerateQuestions = async () => {
		try {
			setIsRequesting(true);
			await questionService.generateQuestions(+id!, { firstPage, lastPage });
			message.success('Questions is generating');
			setIsOpenGenerateModal(false);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsRequesting(false);
			refetchProject();
		}
	};

	const isValidRange = lastPage - firstPage + 1 <= MAX_PAGE_PER_GEN;

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
										const password = window.prompt('Password?');
										return password;
									}}
								/>
							</div>
						</Worker>
					</Col>

					<Col span={24} lg={12} style={{ padding: 10 }}>
						<Space direction='vertical' style={{ width: '100%' }}>
							<Typography.Title level={2}>{project.title}</Typography.Title>

							<Space style={{ width: '100%' }} align='end'>
								<Button
									icon={<ReloadOutlined />}
									loading={isQuestionsRefetching}
									onClick={() => {
										refetchProject();
										refetchQuestions();
									}}
								>
									Reload
								</Button>
							</Space>

							{isLoadingQuestions && <Loader />}

							{questions && (
								<>
									{!questions.length ? (
										<Empty>
											<Button
												type='primary'
												icon={<QuestionCircleOutlined />}
												onClick={() => setIsOpenGenerateModal(true)}
												disabled={project.in_ocr_process}
											>
												{project.in_ocr_process
													? 'Document is in OCR process'
													: 'Generate questions'}
											</Button>
										</Empty>
									) : (
										<Space direction='vertical' style={{ width: '100%' }}>
											<Select<FilterType>
												value={filter}
												style={{ width: 200 }}
												onSelect={setFilter}
											>
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
									onClick={() => setIsOpenGenerateModal(true)}
								>
									{project.in_ocr_process ? 'Document is in OCR process' : 'Generate more'}
								</Button>
							) : (
								<></>
							)}
						</Space>
					</Col>
				</Row>
			)}

			<Modal
				open={isOpenGenerateModal}
				title='Generate questions'
				okButtonProps={{
					disabled: !isValidRange,
				}}
				onCancel={() => setIsOpenGenerateModal(false)}
				onOk={handleGenerateQuestions}
			>
				{project && (
					<Space direction='vertical' style={{ width: '100%' }}>
						<Slider
							range
							value={[firstPage, lastPage]}
							min={1}
							max={project?.pages.length}
							onChange={(numbers) => {
								setFirstPage(numbers[0]);
								setLastPage(numbers[1]);
							}}
						/>
						<Descriptions
							column={1}
							items={[
								{ label: 'First page', children: firstPage },
								{ label: 'Last page', children: lastPage },
							]}
						/>
						<Typography.Text>
							It will take about {Math.ceil((lastPage - firstPage + 1) * 20)} seconds to generate.
						</Typography.Text>
						{!isValidRange && (
							<Alert
								type='error'
								message={`You can only generate ${MAX_PAGE_PER_GEN} pages at a time.`}
							/>
						)}
					</Space>
				)}
			</Modal>
		</div>
	);
}
