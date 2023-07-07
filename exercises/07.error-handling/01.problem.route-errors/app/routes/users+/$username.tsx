import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, type V2_MetaFunction } from '@remix-run/react'
import { db } from '~/utils/db.server.ts'

export async function loader({ params }: DataFunctionArgs) {
	// throw new Error('🐨 Loader error')
	const user = db.user.findFirst({
		where: {
			username: {
				equals: params.username,
			},
		},
	})
	if (!user) {
		throw new Response('User not found', { status: 404 })
	}
	return json({
		user: { name: user.name, username: user.username },
	})
}

export default function ProfileRoute() {
	// throw new Error('🐨 Component error')
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container mb-48 mt-36">
			<h1 className="text-h1">{data.user.name ?? data.user.username}</h1>
			<Link to="notes" className="underline" prefetch="intent">
				Notes
			</Link>
		</div>
	)
}

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Epic Notes`,
		},
	]
}

// 🐨 export an ErrorBoundary here
// 🐨 get the error from useRouteError()
// 💰 If you'd like it to look nice, you can use this class name:
// className="container mx-auto flex h-full w-full items-center justify-center rounded-xl bg-destructive p-20 text-h2 text-destructive-foreground"
