/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusCircleOutlined, RobotOutlined } from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Button, Col, List, Row, Table, Tooltip, Typography, message } from 'antd';
import { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import queryClient from '../../../queryClient';
import chapterService from '../../../services/chapter.service';
import projectService from '../../../services/project.service';
import styles from './index.module.scss';

export default function ProjectPage() {
	const defaultLayoutPluginInstance = defaultLayoutPlugin();

	const { id } = useParams<{ id: string }>();
	const [chapterLoading, setChapterLoading] = useState(0);
	const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);

	const { data: project, isLoading } = useQuery(
		['project', id],
		() => projectService.getProject(id as unknown as number),
		{
			enabled: !!id,
		},
	);

	const handleGenerateQuestions = useCallback(
		async (chapterId: number) => {
			try {
				setChapterLoading(chapterId);
				const newChapter = await chapterService.generateQuestions(chapterId);

				queryClient.setQueryData(['project', id], (oldData: any) => {
					const newChapters = oldData.chapters.map((chapter: any) => {
						if (chapter.id === chapterId) {
							return newChapter;
						}

						return chapter;
					});

					return {
						...oldData,
						chapters: newChapters,
					};
				});
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setChapterLoading(0);
			}
		},
		[id],
	);

	const handleGenerateChapters = useCallback(
		async (projectId: number) => {
			try {
				setIsGeneratingChapters(true);
				const project = await projectService.generateChapters(projectId);

				queryClient.setQueryData(['project', id], project);
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsGeneratingChapters(false);
			}
		},
		[id],
	);

	return (
		<div className={styles.wrapper}>
			{isLoading && <Loader />}

			{project && (
				<Row>
					<Col span={24} lg={12} style={{ padding: 10 }}>
						<Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
							<div className={styles.pdfWrapper}>
								<Viewer
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

						{project.chapters.length ? (
							<Table
								pagination={false}
								dataSource={project.chapters}
								rowKey={(chapter) => chapter.id}
								rowClassName={styles.tableRow}
								columns={[
									{ dataIndex: 'title', title: 'Chapter' },
									{ dataIndex: 'first_page', title: 'First page' },
									{ dataIndex: 'last_page', title: 'Last page' },
									{
										render(_value, chapter) {
											return (
												chapter.questions.length === 0 && (
													<Tooltip title='Generate questions'>
														<Button
															icon={<PlusCircleOutlined />}
															type='primary'
															loading={chapterLoading === chapter.id}
															onClick={() => handleGenerateQuestions(chapter.id)}
														></Button>
													</Tooltip>
												)
											);
										},
									},
								]}
								defaultExpandAllRows
								expandable={{
									rowExpandable: (question) => question.questions.length > 0,
									expandedRowRender: (question) => (
										<List
											dataSource={question.questions}
											renderItem={(item) => (
												<List.Item key={item.id}>
													<List.Item.Meta
														title={item.question}
														description={
															<List
																dataSource={item.answers}
																renderItem={(answer, index) => (
																	<List.Item key={answer.id}>
																		<List.Item.Meta
																			description={`${index + 1}. ${
																				answer.answer
																			} (${answer.is_true ? 'true' : 'false'})`}
																		/>
																	</List.Item>
																)}
															/>
														}
													/>
												</List.Item>
											)}
											pagination={false}
										/>
									),
								}}
							/>
						) : (
							<div
								style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}
							>
								<Button
									type='primary'
									icon={<RobotOutlined />}
									loading={isGeneratingChapters}
									onClick={() => handleGenerateChapters(project.id)}
								>
									Generate chapters
								</Button>
							</div>
						)}
					</Col>
				</Row>
			)}
		</div>
	);
}
