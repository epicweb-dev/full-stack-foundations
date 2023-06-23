// This should run by node without any dependencies
// because you may need to run it without deps.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

function exists(dir) {
	try {
		fs.statSync(dir)
		return true
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...p) => path.join(__dirname, ...p)

const workshopRoot = here('..')
const examples = (await readDir(here('../examples'))).map(dir =>
	here(`../examples/${dir}`),
)
const exercises = await readDir(here('../exercises'))
const apps = (
	await Promise.all([
		...(
			await readDir(here('../examples'))
		).map(dir => here(`../examples/${dir}`)),
		...exercises.flatMap(async exercise => {
			const exerciseDir = here(`../exercises/${exercise}`)
			// if it is just a file instead of a directory, skip it
			if (!(await fs.promises.stat(exerciseDir)).isDirectory()) {
				return []
			}
			return (await readDir(exerciseDir))
				.filter(dir => {
					return /(problem|solution)/.test(dir)
				})
				.map(dir => here(`../exercises/${exercise}/${dir}`))
		}),
	])
).flat()

// update the package.json file name property
// to match the parent directory name + directory name
// e.g. exercises/01-goo/problem.01-great
// name: "exercises.01-goo.problem.01-great"

const relativeToWorkshopRoot = dir =>
	dir.replace(`${workshopRoot}${path.sep}`, '')

const appsWithPkgJson = [...examples, ...apps].filter(app => {
	const pkgjsonPath = path.join(app, 'package.json')
	return exists(pkgjsonPath)
})
for (const file of appsWithPkgJson) {
	const pkgjsonPath = path.join(file, 'package.json')
	const pkg = JSON.parse(await fs.promises.readFile(pkgjsonPath, 'utf8'))
	pkg.name = relativeToWorkshopRoot(file).replace(/\\|\//g, '__sep__')
	await fs.promises.writeFile(pkgjsonPath, JSON.stringify(pkg, null, 2))
}

const tsconfig = {
	files: [],
	exclude: ['node_modules'],
	references: appsWithPkgJson.map(a => ({
		path: relativeToWorkshopRoot(a).replace(/\\/g, '/'),
	})),
}
await fs.promises.writeFile(
	path.join(workshopRoot, 'tsconfig.json'),
	JSON.stringify(tsconfig, null, 2),
	{ parser: 'json' },
)
