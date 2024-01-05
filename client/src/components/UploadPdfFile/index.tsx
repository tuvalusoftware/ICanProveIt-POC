import { UploadOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { message } from 'antd';
import { useCallback } from 'react';

export type UploadPdfFileProps = {
	onUpload?: (file: File) => void;
};

export default function UploadPdfFile({ onUpload }: UploadPdfFileProps) {
	const handleUpload = useCallback(
		(files: File[]) => {
			const file = files[0];
			if (!file) return;

			if (file.type !== 'application/pdf') {
				message.error('File must be a PDF');
				return;
			}

			onUpload?.(file);
		},
		[onUpload],
	);

	return (
		<label
			className={styles.wrapper}
			onDrop={(event) => {
				event.preventDefault();
				handleUpload(Array.from(event.dataTransfer.files));
			}}
			onDragOver={(event) => {
				event.preventDefault();
			}}
		>
			<UploadOutlined style={{ fontSize: 50 }} />
			<h3>Drag file to upload</h3>

			<input
				type='file'
				accept='application/pdf'
				hidden
				onChange={(event) => {
					handleUpload(Array.from(event.target.files ?? []));
				}}
			/>
		</label>
	);
}
