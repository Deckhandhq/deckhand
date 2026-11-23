import { createApiClient } from '../lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, request, url }) => {
	// En production, le serveur web appelle directement le service api du
	// réseau Docker ; le navigateur, lui, passe par l'origine publique /api.
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
