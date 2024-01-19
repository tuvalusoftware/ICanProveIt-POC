import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages';
import ProjectPage from '../pages/projects/[id]';
import DefaultLayout from '../layouts/DefaultLayout';

const router = createBrowserRouter([
	{
		path: '/',
		Component: DefaultLayout,
		children: [
			{
				path: '/',
				Component: HomePage,
			},
			{
				path: '/projects/:id',
				Component: ProjectPage,
			},
		],
	},
]);

export default router;
