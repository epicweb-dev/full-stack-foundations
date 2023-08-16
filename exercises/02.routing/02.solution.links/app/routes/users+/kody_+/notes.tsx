import { Link, NavLink, Outlet } from '@remix-run/react'
import { cn } from '#app/utils/misc.ts'

export default function NotesRoute() {
	return (
		<div className="flex h-full justify-center pb-12">
			<div>
				<h1 className="text-h1">Notes</h1>
				<ul>
					<li>
						<Link to=".." relative="path" className="underline">
							Back to Kody
						</Link>
					</li>
					<li>
						<NavLink
							to="some-note-id"
							className={({ isActive }) =>
								cn('underline', isActive && 'bg-accent')
							}
						>
							Some Note
						</NavLink>
					</li>
				</ul>
			</div>
			<Outlet />
		</div>
	)
}
