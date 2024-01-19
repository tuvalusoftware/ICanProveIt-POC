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
				<Link to='/'>Home</Link>
			</div>
			<Outlet />
		</>
	);
}
