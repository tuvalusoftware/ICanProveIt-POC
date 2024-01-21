/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ClockCircleOutlined,
	CloudUploadOutlined,
	DeleteFilled,
	FileOutlined,
	FolderOpenFilled,
	PictureOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import { Alert, Button, Checkbox, List, Modal, Popconfirm, Space, Spin, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import projectService from '../services/project.service';
import styles from './index.module.scss';
import queryClient from '../queryClient';

export default function HomePage() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [performOcr, setPerformOcr] = useState(false);

	const { data: projects, isLoading } = useQuery(['projects'], () => projectService.getProjects());

	const navigate = useNavigate();

	const handleCreateProject = async () => {
		try {
			setIsCreating(true);
			const project = await projectService.createProject(selectedFile!, performOcr);
			navigate(`/projects/${project.id}`);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsCreating(false);
			setSelectedFile(null);
		}
	};

	const handleDeleteProject = async (id: number) => {
		try {
			await projectService.deleteProject(id);
			queryClient.setQueryData(['projects'], (old: any) => old.filter((project: any) => project.id !== id));
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.toolbar}>
				<Button
					type='primary'
					icon={<CloudUploadOutlined />}
					loading={isCreating}
					onClick={() => inputRef.current?.click()}
				>
					Upload document
					<input
						type='file'
						accept='application/pdf'
						hidden
						ref={inputRef}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (!file) return message.info('No file selected');
							setSelectedFile(file);
						}}
					/>
				</Button>
			</div>

			{isLoading ? (
				<Loader />
			) : (
				<List
					bordered
					dataSource={projects}
					renderItem={(project) => (
						<List.Item
							key={project.id}
							actions={[
								<Popconfirm
									title='Delete project'
									description='Do you want delete this project?'
									okType='danger'
									onConfirm={() => handleDeleteProject(project.id)}
								>
									<Button icon={<DeleteFilled />} danger type='primary'></Button>
								</Popconfirm>,
								<Link to={`/projects/${project.id}`}>
									<Button type='primary' icon={<FolderOpenFilled />}>
										View
									</Button>
								</Link>,
							]}
						>
							<List.Item.Meta
								title={project.title}
								description={
									<Space direction='vertical'>
										<table>
											<tbody>
												<tr>
													<td>
														<FileOutlined />
														<span>Page(s)</span>
													</td>
													<td>{project.pages.length}</td>
												</tr>
												<tr>
													<td>
														<ClockCircleOutlined />
														<span>Created at</span>
													</td>
													<td>{dayjs(project.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
												</tr>
												<tr>
													<td>
														<ClockCircleOutlined />
														<span>Updated at</span>
													</td>
													<td>{dayjs(project.updated_at).format('DD/MM/YYYY HH:mm:ss')}</td>
												</tr>
											</tbody>
										</table>

										{(project.in_ocr_process || project.in_question_process) && (
											<Space direction='horizontal'>
												<Spin size='small' />
												{project.in_ocr_process && (
													<Tag color='processing' icon={<PictureOutlined />}>
														OCR processing
													</Tag>
												)}
												{project.in_question_process && (
													<Tag color='green' icon={<QuestionCircleOutlined />}>
														Question processing
													</Tag>
												)}
											</Space>
										)}
									</Space>
								}
							/>
						</List.Item>
					)}
				/>
			)}

			<Modal
				open={!!selectedFile}
				onCancel={() => setSelectedFile(null)}
				onOk={handleCreateProject}
				okButtonProps={{
					loading: isCreating,
				}}
				title='Upload document'
			>
				<Checkbox checked={performOcr} onChange={(e) => setPerformOcr(e.target.checked)}>
					Perform OCR
				</Checkbox>
				<Alert
					type='warning'
					message={
						<p>
							<b>Warning:</b> OCR processing can take a long time depending on the size of the document.
						</p>
					}
				/>
			</Modal>
		</div>
	);
}
