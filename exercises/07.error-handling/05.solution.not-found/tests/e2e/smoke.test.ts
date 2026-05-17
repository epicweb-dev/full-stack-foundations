import { test, expect } from '@playwright/test'

test('can visit the home page', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('Hello World')).toBeVisible()
})

test('post requests to missing routes return the not found response', async ({
	request,
}) => {
	const response = await request.post('/connectors/resource/index.php')

	expect(response.status()).toBe(404)
	expect(await response.text()).toContain('Not found')
})
