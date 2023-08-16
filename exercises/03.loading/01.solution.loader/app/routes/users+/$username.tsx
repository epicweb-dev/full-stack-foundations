import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { db } from '#app/utils/db.server.ts'

export async function loader({ params }: DataFunctionArgs) {
	const user = db.user.findFirst({
		where: {
			username: {
				equals: params.username,
			},
		},
	})
	return json({
		// @ts-expect-error 🦺 we'll fix this next
		user: { name: user.name, username: user.username },
	})
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container mb-48 mt-36">
			<h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
			<Link to="notes" className="underline">
				Notes
			</Link>
		</div>
	)
}
