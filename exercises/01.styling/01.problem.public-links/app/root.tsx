import { LiveReload } from '@remix-run/react'
import { KCDShopIFrameSync } from '@kentcdodds/workshop-app/iframe-sync'

// 🐨 export a links function here that adds the favicon
// 💰 It should have the following properties:
// - rel: 'icon'
// - type: 'image/svg+xml'
// - href: '/favicon.svg'

export default function App() {
	return (
		<html lang="en">
			{/* 🐨 Create a <head> here and put Remix's <Links /> in it */}
			<body>
				<p>Hello World</p>
				<LiveReload />
				<KCDShopIFrameSync />
			</body>
		</html>
	)
}
