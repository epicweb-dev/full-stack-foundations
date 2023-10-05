import { test, expect } from '@playwright/test'

test('checks favicon', async ({ page }) => {
	await page.goto('/')
	const favicon = await page.$('link[rel="icon"]')
	const href = await favicon?.getAttribute('href')
	expect(href, `🚨 The favicon link href cannot be found`).not.toBeNull()
})
