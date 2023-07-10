import { json, type DataFunctionArgs } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
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
			<div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
				<div className="relative col-span-1">
					<div className="absolute inset-0 flex flex-col">
						<Link
							to={`/users/${data.owner.username}`}
							className="pb-4 pl-8 pr-4 pt-12"
						>
							<h1 className="text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{ownerDisplayName}'s Notes
							</h1>
						</Link>
						<ul className="overflow-y-auto overflow-x-hidden pb-12">
							{data.notes.map(note => (
								<li key={note.id}>
									<NavLink
										to={note.id}
										preventScrollReset
										prefetch="intent"
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
					<Outlet />
				</main>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
