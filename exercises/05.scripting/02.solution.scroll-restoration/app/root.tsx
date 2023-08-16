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
import fontStylestylesheetUrl from './styles/font.css'
import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
	return [
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'stylesheet', href: fontStylestylesheetUrl },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export async function loader() {
	return json({ username: os.userInfo().username })
}

export default function App() {
	const data = useLoaderData<typeof loader>()
	return (
		<html lang="en" className="h-full overflow-x-hidden">
			<head>
				<Links />
			</head>
			<body className="bg-background text-foreground">
				<div className="flex h-screen flex-col justify-between">
					<header className="container mx-auto py-6">
						<nav className="flex justify-between">
							<Link to="/">
								<div className="font-light">epic</div>
								<div className="font-bold">notes</div>
							</Link>
							<Link className="underline" to="users/kody">
								Kody
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
				</div>
				<ScrollRestoration />
				<Scripts />
				<KCDShop />
				<LiveReload />
			</body>
		</html>
	)
}
