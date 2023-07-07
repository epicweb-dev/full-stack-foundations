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
	if (!note) {
		throw new Response('Note note found', { status: 404 })
	}
	return json({
		note: { title: note.title, content: note.content },
	})
}

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()

	// 💣 remove this so we can return our form instead
	return <pre>{JSON.stringify(data, null, 2)}</pre>

	// 🐨 render a Remix Form with the method of "post"
	// 🐨 render an <label> with the text "Title" and an <input> with the name "title" and defaultValue of data.note.title
	// 🐨 render an <label> with the text "Content" and an <textarea> with the name "content" and defaultValue of data.note.content
	// 🐨 render a button with the text "Submit"

	// 💯 as extra credit, you can add a reset button (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
	// 💯 as extra credit, you can use the Label, Input, Textarea, and Button components from '~/components/ui/*.tsx'
	// 💯 as extra credit, style it nicely with some tailwind classes to give it some space.
	// 💯 if you *really* have extra time, you can wrap the submit and reset buttons in a div with "floating-toolbar" and make that look nice.
}
