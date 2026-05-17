import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const catchAllRouteId = 'routes/$'

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getWorkshopAppServerBuildPath() {
	const packageJsonPath = require.resolve('@epic-web/workshop-app/package.json')
	return path.join(path.dirname(packageJsonPath), 'build/server/index.js')
}

export function patchServerBuild(contents) {
	const routeModuleName = contents.match(
		/"routes\/\$":\s*\{[\s\S]*?module:\s*(route\d+)/,
	)?.[1]

	if (!routeModuleName) {
		throw new Error(`Unable to find ${catchAllRouteId} module in workshop app build`)
	}

	const routeModulePattern = new RegExp(
		`const ${escapeRegExp(routeModuleName)} = /\\* @__PURE__ \\*/ Object\\.freeze\\(/\\* @__PURE__ \\*/ Object\\.defineProperty\\(\\{([\\s\\S]*?)\\n\\}, Symbol\\.toStringTag`,
	)
	const routeModuleMatch = contents.match(routeModulePattern)

	if (!routeModuleMatch) {
		throw new Error(`Unable to find ${catchAllRouteId} route module declaration`)
	}

	const routeModuleBody = routeModuleMatch[1]
	const loaderName = routeModuleBody.match(
		/\n\s+loader:\s*([A-Za-z_$][\w$]*)/,
	)?.[1]

	if (!loaderName) {
		throw new Error(`Unable to find ${catchAllRouteId} loader export`)
	}

	let patchedRouteAction = false
	if (!/\n\s+action:/.test(routeModuleBody)) {
		const patchedRouteModuleBody = routeModuleBody.replace(
			/\n(\s+)loader:\s*([A-Za-z_$][\w$]*)/,
			`\n$1action: ${loaderName},\n$1loader: $2`,
		)
		contents = contents.replace(routeModuleBody, patchedRouteModuleBody)
		patchedRouteAction = true
	}

	let patchedManifest = false
	contents = contents.replace(
		/"routes\/\$": \{([\s\S]{0,600}?)"hasAction": false/g,
		(match, routeManifestPrefix) => {
			patchedManifest = true
			return `"routes/$": {${routeManifestPrefix}"hasAction": true`
		},
	)

	return { contents, patchedRouteAction, patchedManifest }
}

export async function patchInstalledWorkshopApp() {
	const serverBuildPath = getWorkshopAppServerBuildPath()
	const originalContents = await fs.readFile(serverBuildPath, 'utf8')
	const result = patchServerBuild(originalContents)

	if (result.contents !== originalContents) {
		await fs.writeFile(serverBuildPath, result.contents)
	}

	const actionStatus = result.patchedRouteAction ? 'added' : 'already present'
	const manifestStatus = result.patchedManifest ? 'updated' : 'already current'
	console.log(
		`Patched @epic-web/workshop-app ${catchAllRouteId}: action ${actionStatus}, manifest ${manifestStatus}.`,
	)
}

const currentFilePath = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
	await patchInstalledWorkshopApp()
}
