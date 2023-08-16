import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'child_process'
import fsExtra from 'fs-extra'
import { $ } from 'execa'
import {
	getApps,
	isProblemApp,
	setPlayground,
} from '@kentcdodds/workshop-app/apps.server'
import { getWatcher } from '@kentcdodds/workshop-app/change-tracker'

// getApps expects this env var
process.env.NODE_ENV = 'development'

const allApps = await getApps()
const uniqueApps = allApps.filter(
	(a, index) => allApps.findIndex(b => b.fullPath === a.fullPath) === index,
)
const problemApps = allApps.filter(isProblemApp)

if (!process.env.SKIP_PLAYWRIGHT) {
	console.log(
		'🎭 installing playwright for testing... This may require sudo (or admin) privileges and may ask for your password.',
	)
	try {
		await $({
			all: true,
		})`npx playwright install chromium --with-deps`
		console.log('✅ playwright installed')
	} catch (playwrightErrorResult) {
		console.log(playwrightErrorResult.all)
		throw new Error('❌  playwright install failed')
	}
}

if (!process.env.SKIP_PLAYGROUND) {
	const firstProblemApp = problemApps[0]
	if (firstProblemApp) {
		console.log('🛝  setting up the first problem app...')
		const playgroundPath = path.join(process.cwd(), 'playground')
		if (await fsExtra.exists(playgroundPath)) {
			console.log('🗑  deleting existing playground app')
			await fsExtra.remove(playgroundPath)
		}
		await setPlayground(firstProblemApp.fullPath).then(
			() => {
				console.log('✅ first problem app set up')
			},
			error => {
				console.error(error)
				throw new Error('❌  first problem app setup failed')
			},
		)
	}
}

if (!process.env.SKIP_PRISMA) {
	console.log(`🏗  generating prisma client in all ${allApps.length} apps...`)
	for (const app of allApps) {
		try {
			await $({ cwd: app.fullPath, all: true })`prisma generate`
		} catch (prismaGenerateResult) {
			console.log(prismaGenerateResult.all)
			throw new Error(`❌  prisma generate failed in ${app.relativePath}`)
		}
	}
	console.log('✅ prisma client generated')
}

getWatcher().close()
