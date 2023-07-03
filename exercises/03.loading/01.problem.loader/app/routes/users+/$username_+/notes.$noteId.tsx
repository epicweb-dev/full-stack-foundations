import { useParams } from '@remix-run/react'

// 🐨 export a loader function here

export default function NoteRoute() {
	// 💣 you can remove the params here, we don't need it anymore
	const params = useParams()
	// 🐨 get the data from the loader using useLoaderData
	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow">
				<h2 className="mb-2 text-h2 lg:mb-6">
					{params.noteId} (🐨 replace this with the title)
				</h2>
				<p className="text-sm md:text-lg">🐨 Note content goes here...</p>
			</div>
		</div>
	)
}
