import { App as AntApp, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { QueryClientProvider } from 'react-query';
import queryClient from './queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ConfigProvider>
				<AntApp>
					<RouterProvider router={router} />
				</AntApp>
			</ConfigProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
