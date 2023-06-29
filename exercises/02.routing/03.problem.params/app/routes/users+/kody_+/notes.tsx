import { Link, NavLink, Outlet } from '@remix-run/react'

export default function NotesRoute() {
	return (
		<div className="flex h-full pb-12">
			<div>
				<h1 className="text-h1">Notes</h1>
				<ul>
					<li>
						<Link to=".." relative="path" className="underline">
							{/* 🐨 instead of hard coding "Kody", get the username from useParams */}
							Back to Kody
						</Link>
					</li>
					<li>
						<NavLink
							// 💰 you can leave this here for now, we'll get a list of notes
							// in a future exercise.
							to="some-note-id"
							className={({ isActive }) =>
								`underline ${isActive ? 'bg-accent' : ''}`
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
