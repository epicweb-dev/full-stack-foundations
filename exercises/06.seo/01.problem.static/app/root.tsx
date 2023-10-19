import os from 'node:os'
import { cssBundleHref } from '@remix-run/css-bundle'
import { json, type LinksFunction } from '@remix-run/node'
import {
	Link,
	Links,
	LiveReload,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import faviconAssetUrl from './assets/favicon.svg'
import { KCDShop } from './kcdshop.tsx'
import fontStylesheetUrl from './styles/font.css'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { getEnv } from './utils/env.server.ts'

export const links: LinksFunction = () => {
	return [
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'stylesheet', href: fontStylesheetUrl },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export async function loader() {
	return json({ username: os.userInfo().username, ENV: getEnv() })
}

export default function App() {
	const data = useLoaderData<typeof loader>()
	return (
		<html lang="en" className="h-full overflow-x-hidden">
			<head>
				{/*
					🐨 add <title>
					(use whatever you'd like for the title)
					🐨 add <meta> for description
					(use whatever you'd like for the description)
					🐨 add <meta> for charSet
					💰 here's a good charSet value: "utf-8"
					🐨 add <meta> for and viewport
					💰 here's a good viewport value: "width=device-width,initial-scale=1"
				 */}
				<Links />
			</head>
			<body className="flex h-full flex-col justify-between bg-background text-foreground">
				<header className="container mx-auto py-6">
					<nav className="flex justify-between">
						<Link to="/">
							<div className="font-light">epic</div>
							<div className="font-bold">notes</div>
						</Link>
						<Link className="underline" to="users/kody/notes/d27a197e">
							Kody's Notes
						</Link>
					</nav>
				</header>

				<div className="flex-1">
					<Outlet />
				</div>

				<div className="container mx-auto flex justify-between">
					<Link to="/">
						<div className="font-light">epic</div>
						<div className="font-bold">notes</div>
					</Link>
					<p>Built with ♥️ by {data.username}</p>
				</div>
				<div className="h-5" />
				<ScrollRestoration />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
					}}
				/>
				<Scripts />
				<KCDShop />
				<LiveReload />
			</body>
		</html>
	)
}
