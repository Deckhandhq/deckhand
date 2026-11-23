import type { RequestHandler } from './$types';

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://api:3000';

/**
 * Same-origin `/api/*` proxy. Used when no external reverse proxy strips the
 * prefix (e.g. a local HAProxy pointing everything at the web service).
 * With Caddy, `/api/*` is routed directly to the API and this route is unused.
 */
const forward: RequestHandler = async ({ params, request, url }) => {
	const path = params.path ?? '';
	const target = new URL(`${API_INTERNAL_URL}/${path}${url.search}`);
	const upstream = new Request(target, request);

	// The incoming Host belongs to this server, not to the API.
	upstream.headers.delete('host');

	return fetch(upstream);
};

export const fallback = forward;
