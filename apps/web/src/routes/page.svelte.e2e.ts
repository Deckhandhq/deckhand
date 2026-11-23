import { expect, test } from '@playwright/test';

test('the page displays the API status', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Deckhand' })).toBeVisible();
});
