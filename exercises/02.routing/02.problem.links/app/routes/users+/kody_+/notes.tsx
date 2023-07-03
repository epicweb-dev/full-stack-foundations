import { Outlet } from '@remix-run/react'

export default function NotesRoute() {
	return (
		<div className="flex h-full justify-center pb-12">
			<h1 className="text-h1">Notes</h1>
			{/* 🐨 add two links here.
				One to go back to the parent path
				and the other to go to the some-note-id route
			*/}
			{/* 💰 feel free to restructure things however you like to make them look nice */}
			<Outlet />
		</div>
	)
}
