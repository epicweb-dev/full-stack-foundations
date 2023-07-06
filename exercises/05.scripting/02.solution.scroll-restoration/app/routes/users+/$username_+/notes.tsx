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
	})
	if (!owner) {
		throw new Response('Owner not found', { status: 404 })
	}
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
		<div className="container flex h-full min-h-[400px] pb-12">
			<div className="grid w-full flex-grow grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
				<div className="relative col-span-1">
					<div className="absolute inset-0 overflow-y-auto overflow-x-hidden [&>:last-child]:pb-12">
						<Link
							to={`/users/${data.owner.username}`}
							className="mb-4 flex flex-col items-center justify-center gap-2 pl-8 pr-4 lg:flex-row lg:justify-start lg:gap-4"
						>
							<h1 className="text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{ownerDisplayName}'s Notes
							</h1>
						</Link>
						<ul className="h-full overflow-y-auto">
							{data.notes.map(note => (
								<li key={note.id}>
									<NavLink
										to={note.id}
										preventScrollReset
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
