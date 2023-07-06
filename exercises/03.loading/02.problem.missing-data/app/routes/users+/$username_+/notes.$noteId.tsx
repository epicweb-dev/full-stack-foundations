import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '~/utils/db.server.ts'

export async function loader({ params }: DataFunctionArgs) {
	const note = db.note.findFirst({
		where: {
			id: {
				equals: params.noteId,
			},
		},
	})
	// 🐨 add an if statement here to check whether the note exists and throw an
	// appropriate 404 response if not.
	// 🦺 then you can remove the @ts-expect-error below 🎉
	return json({
		// @ts-expect-error 🦺 we'll fix this next
		note: { title: note.title, content: note.content },
	})
}

export default function NoteRoute() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="flex h-full flex-col overflow-y-auto overflow-x-hidden">
			<div className="flex-grow">
				<h2 className="mb-2 text-h2 lg:mb-6">{data.note.title}</h2>
				<p className="text-sm md:text-lg">{data.note.content}</p>
			</div>
		</div>
	)
}
