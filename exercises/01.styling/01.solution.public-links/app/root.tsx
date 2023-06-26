import { type LinksFunction } from '@remix-run/node'
import { Links, LiveReload } from '@remix-run/react'
import { KCDShopIFrameSync } from '@kentcdodds/workshop-app/iframe-sync'

export const links: LinksFunction = () => {
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
				<LiveReload />
				<KCDShopIFrameSync />
			</body>
		</html>
	)
}
