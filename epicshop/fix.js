// This should run by node without any dependencies
// because you may need to run it without deps.

import fs from 'node:fs'
import cp from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...p) => path.join(__dirname, ...p)
const VERBOSE = false
const logVerbose = (...args) => (VERBOSE ? console.log(...args) : undefined)

const workshopRoot = here('..')
const examples = (await readDir(here('../examples'))).map(dir =>
	here(`../examples/${dir}`),
)
const exercises = (await readDir(here('../exercises')))
	.map(name => here(`../exercises/${name}`))
	.filter(filepath => fs.statSync(filepath).isDirectory())
const exerciseApps = (
	await Promise.all(
		exercises.flatMap(async exercise => {
			return (await readDir(exercise))
				.filter(dir => {
					return /(problem|solution)/.test(dir)
				})
				.map(dir => path.join(exercise, dir))
		}),
	)
).flat()
const exampleApps = (await readDir(here('../examples'))).map(dir =>
	here(`../examples/${dir}`),
)
const apps = [...exampleApps, ...exerciseApps]

const appsWithPkgJson = [...examples, ...apps].filter(app => {
	const pkgjsonPath = path.join(app, 'package.json')
	return exists(pkgjsonPath)
})

// update the package.json file name property
// to match the parent directory name + directory name
// e.g. exercises/01-goo/problem.01-great
// name: "exercises__sep__01-goo.problem__sep__01-great"

function relativeToWorkshopRoot(dir) {
	return dir.replace(`${workshopRoot}${path.sep}`, '')
}

await updatePkgNames()
await updateTsconfig()
if (process.env.SKIP_DB_FIX !== 'true') {
	await updateDataDb()
}

async function updatePkgNames() {
	for (const file of appsWithPkgJson) {
		const pkgjsonPath = path.join(file, 'package.json')
		const pkg = JSON.parse(await fs.promises.readFile(pkgjsonPath, 'utf8'))
		pkg.name = relativeToWorkshopRoot(file).replace(/\\|\//g, '__sep__')
		const written = await writeIfNeeded(
			pkgjsonPath,
			`${JSON.stringify(pkg, null, 2)}\n`,
		)
		if (written) {
			console.log(`updated ${path.relative(process.cwd(), pkgjsonPath)}`)
		}
	}
}

async function updateTsconfig() {
	const tsconfig = {
		files: [],
		exclude: ['node_modules'],
		references: appsWithPkgJson.map(a => ({
			path: relativeToWorkshopRoot(a).replace(/\\/g, '/'),
		})),
	}
	const written = await writeIfNeeded(
		path.join(workshopRoot, 'tsconfig.json'),
		`${JSON.stringify(tsconfig, null, 2)}\n`,
		{ parser: 'json' },
	)

	if (written) {
		// delete node_modules/.cache
		const cacheDir = path.join(workshopRoot, 'node_modules', '.cache')
		if (exists(cacheDir)) {
			await fs.promises.rm(cacheDir, { recursive: true })
		}
		console.log('all fixed up')
	}
}

async function writeIfNeeded(filepath, content) {
	const oldContent = await fs.promises.readFile(filepath, 'utf8')
	if (oldContent !== content) {
		await fs.promises.writeFile(filepath, content)
	}
	return oldContent !== content
}

async function updateDataDb() {
	let latestPrismaApp

	const appsWithPrisma = apps.filter(app => exists(path.join(app, 'prisma')))
	// copy this to all the other apps
	for (const app of appsWithPrisma) {
		const prismaIsUnchanged = latestPrismaApp
			? await dirsAreTheSame(
					path.join(latestPrismaApp, 'prisma'),
					path.join(app, 'prisma'),
					[/data\.db/],
			  )
			: false
		if (!prismaIsUnchanged) {
			if (latestPrismaApp) {
				logVerbose(
					`The prisma folder in ${rel(app)} is different to ${rel(
						latestPrismaApp,
					)}. Updating the latest.`,
				)
			} else {
				logVerbose(`Setting the latest prisma app to ${rel(app)}`)
			}
			latestPrismaApp = app
			await reseedIfNecessary(latestPrismaApp)
		}
		const pathToLatestAppDb = path.join(latestPrismaApp, 'prisma/data.db')
		const pathToDestAppDb = path.join(app, 'prisma/data.db')
		if (pathToLatestAppDb !== pathToDestAppDb) {
			if (!isSameFile(pathToLatestAppDb, pathToDestAppDb)) {
				console.log(
					`Copying data.db from ${rel(latestPrismaApp)} to ${rel(app)}`,
				)
				await fs.promises.copyFile(pathToLatestAppDb, pathToDestAppDb)
			} else {
				logVerbose(
					`Skipping copying ${rel(pathToLatestAppDb)} to ${rel(
						pathToDestAppDb,
					)} because they are the same`,
				)
			}
		}
	}
}

function isSameFile(file1, file2) {
	const f1IsFile = isFile(file1)
	const f2IsFile = isFile(file2)
	if (!f1IsFile && !f2IsFile) return true
	if (f1IsFile !== f2IsFile) return false

	return fs.readFileSync(file1).equals(fs.readFileSync(file2))
}

async function dirsAreTheSame(dir1, dir2, exclude = []) {
	const dir1Exists = exists(dir1)
	const dir2Exists = exists(dir2)
	// if they both don't exist, they're the same
	if (!dir1Exists && !dir2Exists) return true

	// if only one doesn't exist, they'd different
	if (dir1Exists !== dir2Exists) return false

	// Read the content of both directories
	const dir1Contents = await readDir(dir1)
	const dir2Contents = await readDir(dir2)

	// Filter the content based on the exclude array
	const dir1FilteredContents = dir1Contents.filter(
		filename => !exclude.some(regex => regex.test(filename)),
	)
	const dir2FilteredContents = dir2Contents.filter(
		filename => !exclude.some(regex => regex.test(filename)),
	)

	// Check if the number of files and directories are the same
	if (dir1FilteredContents.length !== dir2FilteredContents.length) return false

	// Check the content recursively
	for (const item of dir1FilteredContents) {
		const itemPath1 = path.join(dir1, item)
		const itemPath2 = path.join(dir2, item)

		// Check if the item is a file and compare the content
		if (isFile(itemPath1) && isFile(itemPath2)) {
			if (!isSameFile(itemPath1, itemPath2)) return false
		} else {
			// If the item is a directory, call the function recursively
			const result = await dirsAreTheSame(itemPath1, itemPath2, exclude)
			if (!result) return false
		}
	}

	// If no differences were found, return true
	return true
}

async function isNewer(maybeOlder, maybeNewer, exclude = []) {
	const olderStat = await getNewestStat(maybeOlder, exclude)
	const newerStat = await getNewestStat(maybeNewer, exclude)
	return olderStat.mtimeMs < newerStat.mtimeMs
}

async function getNewestStat(fileOrDirPath, exclude) {
	const stats = await fs.promises.stat(fileOrDirPath)
	if (stats.isFile()) {
		return stats
	}
	const files = await fs.promises.readdir(fileOrDirPath)
	const filteredFiles = files.filter(
		file => !exclude.some(regex => regex.test(file)),
	)
	const statsPromises = filteredFiles.map(file =>
		getNewestStat(path.join(fileOrDirPath, file), exclude),
	)
	const statsArray = await Promise.all(statsPromises)
	return statsArray.reduce((newestStat, currentStat) => {
		// NOTE: this may be surprising, but we exclude the directory itself because
		// we want to compare the contents of the directory, not the directory itself
		if (!newestStat) return currentStat
		if (!currentStat) return newestStat
		return currentStat.mtimeMs > newestStat.mtimeMs ? currentStat : newestStat
	}, null)
}

async function reseedIfNecessary(app) {
	const latestPrismaChange = await getNewestStat(path.join(app, 'prisma'), [
		/data\.db/,
	])
	const dbChange = await getNewestStat(path.join(app, 'prisma', 'data.db'))
	const modifiedTimeDifference = dbChange.mtimeMs - latestPrismaChange.mtimeMs
	// if the difference is negative, the db is older than the prisma folder
	// if the difference is longer than a minute, then someone changed something
	// after the seed script finished. We want to override that.
	if (modifiedTimeDifference < 0 || modifiedTimeDifference > 1000 * 60) {
		console.log(
			`The data.db file is out of date for ${rel(
				app,
			)} (modifiedTimeDifference: ${modifiedTimeDifference}). Re-seeding...`,
		)
		// touch the seed.ts file to update it's modified time relatively recently
		// to the data.db file
		await fs.promises.utimes(
			path.join(app, 'prisma', 'seed.ts'),
			new Date(),
			new Date(),
		)
		cp.execSync('npx prisma db seed', { cwd: app, stdio: 'inherit' })
	} else {
		logVerbose(
			`Skipping re-seeding ${rel(
				app,
			)} because the data.db file is up to date with a modifiedTimeDifference of ${modifiedTimeDifference}`,
		)
	}
}

function exists(p) {
	if (!p) return false
	try {
		fs.statSync(p)
		return true
	} catch (error) {
		return false
	}
}

function isFile(p) {
	try {
		return fs.statSync(p).isFile()
	} catch (error) {
		return false
	}
}

async function readDir(dir) {
	if (exists(dir)) {
		return fs.promises.readdir(dir)
	}
	return []
}

function rel(dir) {
	return path.relative(process.cwd(), dir)
}
