import { Spin, Typography } from 'antd';
import styles from './index.module.scss';

export type LoaderProps = {
	message?: string;
};

export default function Loader({ message }: LoaderProps) {
	return (
		<div className={styles.wrapper}>
			<Spin />

			<Typography>{message || 'Loading...'}</Typography>
		</div>
	);
}
