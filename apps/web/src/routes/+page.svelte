<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Deckhand</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-8">
	<h1 class="text-3xl font-semibold">Deckhand</h1>
	<p class="mt-2 text-sm text-gray-600">API: {data.health}</p>
</main>
