import { useParams } from '@remix-run/react'
// 🐨 get the db utility using:
// import { db } from '#app/utils/db.server.ts'

// 🐨 export a loader function here
// 💰 Here's how you get the note from the database:
// const note = db.note.findFirst({
// 	where: {
// 		id: { equals: noteId, },
// 	},
// })
// 🐨 return the necessary note data using Remix's json util
// 🦺 TypeScript will complain about the note being possibly undefined, we'll
// fix that in the next section
// 💯 as extra credit, try to do it with new Response instead of using the json util just for fun
// 🦉 Note, you should definitely use the json helper as it's easier and works better with TypeScript
// but feel free to try it with new Response if you want to see how it works.

export default function NoteRoute() {
	// 💣 you can remove the params here, we don't need it anymore
	const params = useParams()
	// 🐨 get the data from the loader using useLoaderData
	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">
				{params.noteId} (🐨 replace this with the title)
			</h2>
			<div className="overflow-y-auto pb-24">
				<p className="whitespace-break-spaces text-sm md:text-lg">
					🐨 Note content goes here...
				</p>
			</div>
		</div>
	)
}
