import fs from 'fs'
import path from 'path'
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

const dataDbPath = path.join(process.cwd(), 'data.db')
if (await fsExtra.exists(dataDbPath)) {
	console.log('🗑  deleting data.db from cwd...')
	await fsExtra.remove(dataDbPath)
}

console.log(
	'📝 copying .env.example to .env files and generating prisma client...',
)

for (const app of uniqueApps) {
	await fs.promises.copyFile(
		path.join(app.fullPath, '.env.example'),
		path.join(app.fullPath, '.env'),
	)
}
console.log('✅ .env files copied')

console.log('◭  generating prisma client...')
// we just grab the last problem app and set that one up because we're setup to
// have all the exercise apps share a single database and prisma has a
// postinstall that sets up the client in each individual app anyway.
const lastProblemApp = problemApps[problemApps.length - 1]
const lastSchema = path.join(
	lastProblemApp.relativePath,
	'prisma/schema.prisma',
)
const prismaClientResult = await $({
	all: true,
})`prisma generate --schema=${lastSchema}`

if (prismaClientResult.exitCode === 0) {
	console.log('✅ prisma client generated')
} else {
	console.log(prismaClientResult.all)
	throw new Error('❌  prisma client generation failed')
}

console.log('🏗️  running prisma migrate...')
const prismaMigrateResult = await $({
	all: true,
	cwd: lastProblemApp.fullPath,
})`npx prisma migrate deploy`
if (prismaMigrateResult.exitCode === 0) {
	console.log('✅ prisma migrate deployed')
} else {
	console.log(prismaMigrateResult.all)
	throw new Error('❌  prisma migrate deploy failed')
}

console.log('🌱 Seeding the database...')
const seedResult = await $({
	cwd: lastProblemApp.fullPath,
	stdio: 'inherit',
})`npx prisma db seed`
if (seedResult.exitCode === 0) {
	console.log('✅ Database seeded')
} else {
	throw new Error('❌  Database seeding failed')
}

console.log(
	'🎭 installing playwright for testing... This may require sudo (or admin) privileges and may ask for your password.',
)
const playwrightResult = await $({
	all: true,
})`npx playwright install chromium --with-deps`
if (playwrightResult.exitCode === 0) {
	console.log('✅ playwright installed')
} else {
	console.log(playwrightResult.all)
	throw new Error('❌  playwright install failed')
}

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

getWatcher().close()
