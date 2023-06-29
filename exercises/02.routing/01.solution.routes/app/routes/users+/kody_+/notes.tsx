import { Outlet } from '@remix-run/react'

export default function NotesRoute() {
	return (
		<div className="flex h-full pb-12">
			<h1 className="text-h1">Notes</h1>
			<Outlet />
		</div>
	)
}
