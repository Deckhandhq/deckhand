import type { App } from '@deckhand/api/app';
import { treaty } from '@elysia/eden';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientOptions = {
	/** Origine de l'API : publique pour le navigateur, interne pour le SSR. */
	baseUrl: string;
	/** `event.fetch` côté serveur pour conserver les cookies. */
	fetch?: FetchLike;
	/** Cookie transmis lors du rendu serveur. */
	cookie?: string | null;
	/** Préfixe ajouté au chemin (='/api' derrière le reverse proxy, '' en interne). */
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
 * Client Eden typé par `App`. Le préfixe `/api` est ajouté côté navigateur
 * (proxy Vite en dev, reverse proxy en prod) ; le SSR peut viser l'API
 * directement via `API_INTERNAL_URL` sans passer par TLS public.
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
