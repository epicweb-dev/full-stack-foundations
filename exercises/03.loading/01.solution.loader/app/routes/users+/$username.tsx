import { Link, useLoaderData } from '@remix-run/react'
import { json, type DataFunctionArgs } from '@remix-run/node'
import { db } from '~/utils/db.server.ts'

export async function loader({ params }: DataFunctionArgs) {
	const user = db.user.findFirst({
		where: {
			username: {
				equals: params.username,
			},
		},
		strict: true,
	})
	return json({
		user: { name: user.name },
	})
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container mb-48 mt-36">
			<h1 className="text-h1">{data.user.name}</h1>
			<Link to="notes" className="underline">
				Notes
			</Link>
		</div>
	)
}
