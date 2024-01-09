import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages';
import ProjectPage from '../pages/projects/[id]';

const router = createBrowserRouter([
	{
		path: '/',
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
