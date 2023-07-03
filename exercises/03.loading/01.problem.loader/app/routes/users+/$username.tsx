import { Link, useParams } from '@remix-run/react'
// 🐨 get the database from the utils directory using
// import { db } from '~/utils/db.server.ts'

// 🐨 add a `loader` export here which uses the params from the DataFunctionArgs
// 🐨 you'll get the username from params.username
// 💰 Here's how you get the user from the database:
// const user = db.user.findFirst({
// 	where: {
// 		username: { equals: username },
// 	},
// 	strict: true,
// })
// 🐨 Return the necessary user data using Remix's json util
// 💯 as extra credit, try to do it with new Response instead of using the json util

export default function ProfileRoute() {
	// 💣 we no longer need to get the params in the UI, delete this:
	const params = useParams()
	// 🐨 get the data from the loader with useLoaderData
	return (
		<div className="container mb-48 mt-36">
			{/*
				🐨 swap params.username with the user's name
				(💯 note, the user's name is not required, so as extra credit, add a
				fallback to the username)
			*/}
			<h1 className="text-h1">{params.username}</h1>
			<Link to="notes" className="underline">
				Notes
			</Link>
		</div>
	)
}
