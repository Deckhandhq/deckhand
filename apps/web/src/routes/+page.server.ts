import { createApiClient } from '../lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, request, url }) => {
	// In production, the web server calls the api service directly on the
	// Docker network; the browser goes through the public /api origin.
	const internalUrl = process.env.API_INTERNAL_URL;

	const api = createApiClient({
		baseUrl: internalUrl ?? url.origin,
		prefix: internalUrl ? '' : '/api',
		fetch,
		cookie: request.headers.get('cookie')
	});

	const { data, error } = await api.health.get();

	return { health: error ? ('unavailable' as const) : data.status };
};
