import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { type RequestHandler, createRequestHandler } from '@remix-run/express'
import { type ServerBuild, broadcastDevReady } from '@remix-run/node'
import { ip as ipAddress } from 'address'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import getPort, { portNumbers } from 'get-port'
import morgan from 'morgan'

const MODE = process.env.NODE_ENV
const BUILD_PATH = '../build/index.js'
const WATCH_PATH = '../build/version.txt'

const build: ServerBuild = await import(BUILD_PATH)
let devBuild = build

const app = express()

const getHost = (req: { get: (key: string) => string | undefined }) =>
	req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

// ensure HTTPS only (X-Forwarded-Proto comes from Fly)
app.use((req, res, next) => {
	const proto = req.get('X-Forwarded-Proto')
	const host = getHost(req)
	if (proto === 'http') {
		res.set('X-Forwarded-Proto', 'https')
		res.redirect(`https://${host}${req.originalUrl}`)
		return
	}
	next()
})

// no ending slashes for SEO reasons
// https://github.com/epicweb-dev/epic-stack/discussions/108
app.use((req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
		res.redirect(301, safepath + query)
	} else {
		next()
	}
})

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// Remix fingerprints its assets so we can cache forever.
app.use(
	'/build',
	express.static('public/build', { immutable: true, maxAge: '1y' }),
)

// Aggressively cache fonts for a year
app.use(
	'/fonts',
	express.static('public/fonts', { immutable: true, maxAge: '1y' }),
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }))

morgan.token('url', req => decodeURIComponent(req.url ?? ''))
app.use(morgan('tiny'))

app.use((_, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})

function getRequestHandler(build: ServerBuild): RequestHandler {
	function getLoadContext(_: unknown, res: any) {
		return { cspNonce: res.locals.cspNonce }
	}
	return createRequestHandler({ build, mode: MODE, getLoadContext })
}

app.all(
	'*',
	process.env.NODE_ENV === 'development'
		? (...args) => getRequestHandler(devBuild)(...args)
		: getRequestHandler(build),
)

const desiredPort = Number(process.env.PORT || 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

const server = app.listen(portToUse, () => {
	const addy = server.address()
	const portUsed =
		desiredPort === portToUse
			? desiredPort
			: addy && typeof addy === 'object'
			? addy.port
			: 0

	if (portUsed !== desiredPort) {
		console.warn(
			chalk.yellow(
				`⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}
	console.log(`🚀  We have liftoff!`)
	const localUrl = `http://localhost:${portUsed}`
	let lanUrl: string | null = null
	const localIp = ipAddress() ?? 'Unknown'
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portUsed}`
	}

	console.log(
		`
${chalk.bold('Local:')}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold('On Your Network:')}  ${chalk.cyan(lanUrl)}` : ''}
${chalk.bold('Press Ctrl+C to stop')}
		`.trim(),
	)

	if (process.env.NODE_ENV === 'development') {
		broadcastDevReady(build)
	}
})

closeWithGrace(async () => {
	await new Promise((resolve, reject) => {
		server.close(e => (e ? reject(e) : resolve('ok')))
	})
})

// during dev, we'll keep the build module up to date with the changes
if (process.env.NODE_ENV === 'development') {
	async function reloadBuild() {
		devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`)
		broadcastDevReady(devBuild)
	}

	const chokidar = await import('chokidar')
	const dirname = path.dirname(fileURLToPath(import.meta.url))
	const watchPath = path.join(dirname, WATCH_PATH).replace(/\\/g, '/')

	const buildWatcher = chokidar
		.watch(watchPath, { ignoreInitial: true })
		.on('add', reloadBuild)
		.on('change', reloadBuild)

	closeWithGrace(async () => {
		await buildWatcher.close()
	})
}
