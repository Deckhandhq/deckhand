import { expect, test } from '@playwright/test';

test('la page affiche le statut de l’API', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Deckhand' })).toBeVisible();
});
