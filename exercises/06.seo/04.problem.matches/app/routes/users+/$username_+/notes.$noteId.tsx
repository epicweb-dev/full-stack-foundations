import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { db } from '#app/utils/db.server.ts'
import { invariantResponse } from '#app/utils/misc.ts'

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

export async function action({ request, params }: DataFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')

	invariantResponse(intent === 'delete', 'Invalid intent')

	db.note.delete({ where: { id: { equals: params.noteId } } })
	return redirect(`/users/${params.username}/notes`)
}

export default function NoteRoute() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="absolute inset-0 flex flex-col px-10">
			<h2 className="mb-2 pt-12 text-h2 lg:mb-6">{data.note.title}</h2>
			<div className="overflow-y-auto pb-24">
				<p className="whitespace-break-spaces text-sm md:text-lg">
					{data.note.content}
				</p>
			</div>
			<div className={floatingToolbarClassName}>
				<Form method="post">
					<Button
						type="submit"
						variant="destructive"
						name="intent"
						value="delete"
					>
						Delete
					</Button>
				</Form>
				<Button asChild>
					<Link to="edit">Edit</Link>
				</Button>
			</div>
		</div>
	)
}

// 🐨 Create a meta export here

// 🦺 If you want it to be typed, then add a type for the loaders to the
// V2_MetaFunction generic. You can use typeof loader for the first argument.
// And for the second, you use an object mapping the ID to that route's loader's
// type. It's ID is `routes/users+/$username_+/notes` and you can import the
// notes loader from the parent route `./notes.tsx`
// 💰 { 'routes/users+/$username_+/notes': typeof notesLoader }

// 🐨 use the matches from the parameters to find the route for notes by that ID
// 💰 matches.find(m => m.id === 'routes/users+/$username_+/notes')

// 🐨 use the data from our loader and our parent's loader to create a title
// and description that show the note title, user's name, and the first part of
// the note's content.

// 💯 handle the case where the note doesn't have contet.
// 💯 handle the case where the note is too long and add a "..." if necessary
