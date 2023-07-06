import { Link, NavLink, Outlet, useParams } from '@remix-run/react'
import { cn } from '~/utils/misc.ts'
// 🐨 get the db utility using:
// import { db } from '~/utils/db.server.ts'

// 🐨 add a `loader` export here which uses the params from the DataFunctionArgs
// 🐨 you'll get the username from params.username
// 💰 Here's how you get the owner information and the note from the database:
// const owner = db.user.findFirst({
// 	where: {
// 		username: { equals: username, },
// 	},
// 	strict: true,
// })
// const notes = db.note
// 	.findMany({
// 		where: {
// 			owner: {
// 				username: { equals: username, },
// 			},
// 		},
// 	})
// 🐨 return the necessary data using Remix's json util
// 💯 as extra credit, try to do it with new Response instead of using the json util

export default function NotesRoute() {
	// 💣 we no longer need the params, delete this
	const params = useParams()
	// 🐨 get the data from useLoaderData
	// 🐨 update the ownerDisplayName to be what you get from the loader data
	// 💯 note, the user's name is not required, so as extra credit, add a
	// fallback to the username
	const ownerDisplayName = params.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="container flex h-full min-h-[400px] pb-12">
			<div className="grid w-full flex-grow grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
				<div className="relative col-span-1">
					<div className="absolute inset-0 overflow-y-auto overflow-x-hidden [&>:last-child]:pb-12">
						<Link
							// 🐨 we can get the username from the loader data instead
							to={`/users/${params.username}`}
							className="mb-4 flex flex-col items-center justify-center gap-2 pl-8 pr-4 lg:flex-row lg:justify-start lg:gap-4"
						>
							<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{ownerDisplayName}'s Notes
							</h1>
						</Link>
						<ul>
							{/*
							🐨 instead of hard coding the note, create one <li> for each note
							in the database with data.notes.map
						*/}
							<li>
								<NavLink
									to="some-note-id"
									className={({ isActive }) =>
										cn(navLinkDefaultClassName, isActive && 'bg-accent')
									}
								>
									Some Note
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
				<main className="relative col-span-3 bg-accent md:rounded-r-3xl">
					<div className="absolute inset-0 overflow-y-auto px-10 py-12">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
