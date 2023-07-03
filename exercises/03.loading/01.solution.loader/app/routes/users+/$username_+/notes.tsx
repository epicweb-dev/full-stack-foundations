import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { db } from '~/utils/db.server.ts'
import { cn } from '~/utils/misc.ts'

export async function loader({ params }: DataFunctionArgs) {
	const owner = db.user.findFirst({
		where: {
			username: {
				equals: params.username,
			},
		},
		strict: true,
	})
	const notes = db.note
		.findMany({
			where: {
				owner: {
					username: {
						equals: params.username,
					},
				},
			},
		})
		.map(({ id, title }) => ({ id, title }))
	return json({ owner, notes })
}

export default function NotesRoute() {
	const data = useLoaderData<typeof loader>()
	const ownerDisplayName = data.owner.name ?? data.owner.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="flex h-full justify-center pb-12">
			<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
				<div className="col-span-1 py-12">
					<Link
						to={`/users/${data.owner.username}`}
						className="mb-4 flex flex-col items-center justify-center gap-2 pl-8 pr-4 lg:flex-row lg:justify-start lg:gap-4"
					>
						<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
							{ownerDisplayName}'s Notes
						</h1>
					</Link>
					<ul>
						{data.notes.map(note => (
							<li key={note.id}>
								<NavLink
									to={note.id}
									className={({ isActive }) =>
										cn(navLinkDefaultClassName, isActive && 'bg-accent')
									}
								>
									{note.title}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
				<main className="col-span-3 bg-accent px-10 py-12 md:rounded-r-3xl">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
