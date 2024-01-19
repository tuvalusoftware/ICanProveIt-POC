import { QueryClient } from 'react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchInterval: 2_000, // HACK: Trick real-time updates : ))
		},
	},
});

export default queryClient;
