import { KCDShopIFrameSync } from '@kentcdodds/workshop-app/iframe-sync'
import { type LinksFunction } from '@remix-run/node'
import { Links, LiveReload, Scripts } from '@remix-run/react'
// 🐨 import the svg favicon here (use a default import)

export const links: LinksFunction = () => {
	// 🐨 swap the hard-coded href here with the default import of the favicon
	return [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Links />
			</head>
			<body>
				<p>Hello World</p>
				<Scripts />
				<KCDShopIFrameSync />
				<LiveReload />
			</body>
		</html>
	)
}
