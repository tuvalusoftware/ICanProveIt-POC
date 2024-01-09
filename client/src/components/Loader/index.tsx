import { Spin } from 'antd';
import styles from './index.module.scss';

export default function Loader() {
	return (
		<div className={styles.wrapper}>
			<Spin />
		</div>
	);
}
