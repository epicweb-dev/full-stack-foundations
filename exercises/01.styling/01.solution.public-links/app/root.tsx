import { type LinksFunction } from '@remix-run/node'
import { LiveReload } from '@remix-run/react'

export const links: LinksFunction = () => {
	return [{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' }]
}

export default function App() {
	return (
		<html lang="en">
			<body>
				<p>Hello World</p>
				<LiveReload />
			</body>
		</html>
	)
}
