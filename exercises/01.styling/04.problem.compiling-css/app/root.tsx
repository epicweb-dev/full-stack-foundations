import { type LinksFunction } from '@remix-run/node'
import { Links, LiveReload, Scripts } from '@remix-run/react'
import faviconAssetUrl from './assets/favicon.svg'
import { KCDShop } from './kcdshop.tsx'
import fontStylesheetUrl from './styles/font.css'
// 🐨 Import the tailwind stylesheet here

export const links: LinksFunction = () => {
	return [
		{ rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
		{ rel: 'stylesheet', href: fontStylesheetUrl },
		// 🐨 Add the tailwind stylesheet to the links array here
	]
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Links />
			</head>
			<body>
				{/*
					🐨 add a className with tailwind classes to this p tag to check that
					tailwind is processing correctly. Try `p-8 text-xl` for example.
				*/}
				<p>Hello World</p>
				<Scripts />
				<KCDShop />
				<LiveReload />
			</body>
		</html>
	)
}
