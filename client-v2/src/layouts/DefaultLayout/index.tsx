import { HomeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link, Outlet } from 'react-router-dom';

export default function DefaultLayout() {
	return (
		<>
			<div
				style={{
					position: 'sticky',
					top: 0,
					borderBottom: '1px solid #f0f0f0',
					padding: 20,
					background: '#fff',
					zIndex: 100,
				}}
			>
				<Link to='/'>
					<Button icon={<HomeOutlined />} type='link'>
						Home
					</Button>
				</Link>
			</div>
			<Outlet />
		</>
	);
}
