/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, List, message } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import projectService from '../services/project.service';
import styles from './index.module.scss';

export default function HomePage() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCreating, setIsCreating] = useState(false);

	const { data: projects, isLoading } = useQuery('projects', () => projectService.getProjects());

	const navigate = useNavigate();

	const handleCreateProject = useCallback(
		async (file: File) => {
			try {
				setIsCreating(true);
				const project = await projectService.createProject(file);
				navigate(`/projects/${project.id}`);
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsCreating(false);
			}
		},
		[navigate],
	);

	return (
		<div className={styles.wrapper}>
			<div className={styles.toolbar}>
				<Button
					type='primary'
					icon={<UploadOutlined />}
					loading={isCreating}
					size='large'
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

							if (file) {
								handleCreateProject(file);
							}
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
					renderItem={(item) => (
						<List.Item
							key={item.id}
							actions={[
								<Link to={`/projects/${item.id}`}>
									<Button type='link' icon={<EyeOutlined />}>
										View
									</Button>
								</Link>,
							]}
						>
							<List.Item.Meta title={item.title} />
						</List.Item>
					)}
				/>
			)}
		</div>
	);
}
