import type { App } from '@deckhand/api/app';
import { treaty } from '@elysia/eden';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientOptions = {
	/** API origin: public for the browser, internal for SSR. */
	baseUrl: string;
	/** Server-side `event.fetch` to preserve cookies. */
	fetch?: FetchLike;
	/** Cookie sent during server rendering. */
	cookie?: string | null;
	/** Prefix added to the path ('/api' behind the reverse proxy, '' internally). */
	prefix?: string;
};

const rewriteFetcher = (doFetch: FetchLike, prefix: string) =>
	((url: RequestInfo | URL, init?: RequestInit) => {
		const href = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
		const target = new URL(href);
		if (prefix) target.pathname = `${prefix}${target.pathname}`;
		return doFetch(target, init);
	}) as typeof fetch;

/**
 * Eden client typed by `App`. The `/api` prefix is added on the browser side
 * (Vite proxy in dev, reverse proxy in prod); SSR can reach the API
 * directly via `API_INTERNAL_URL` without going through public TLS.
 */
export function createApiClient({
	baseUrl,
	fetch: customFetch,
	cookie,
	prefix = '/api'
}: ApiClientOptions) {
	const doFetch: FetchLike = customFetch ?? ((input, init) => fetch(input, init));

	return treaty<App>(baseUrl.replace(/\/$/, ''), {
		fetch: { credentials: 'include' },
		headers: cookie ? { cookie } : undefined,
		fetcher: rewriteFetcher(doFetch, prefix)
	});
}
