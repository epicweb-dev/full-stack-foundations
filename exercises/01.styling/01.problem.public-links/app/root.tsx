import { LiveReload, Scripts } from '@remix-run/react'
import { EpicShop } from './epicshop.tsx'

// 🐨 export a links function here that adds the favicon
// 💰 It should have the following properties:
// - rel: 'icon'
// - type: 'image/svg+xml'
// - href: '/favicon.svg'

export default function App() {
	return (
		<html lang="en">
			<head>{/* 🐨 Put Remix's <Links /> in here */}</head>
			<body>
				<p>Hello World</p>
				<Scripts />
				<EpicShop />
				<LiveReload />
			</body>
		</html>
	)
}
