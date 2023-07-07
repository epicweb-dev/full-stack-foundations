import { json, type DataFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button } from '~/components/ui/button.tsx'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import { Textarea } from '~/components/ui/textarea.tsx'
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

// 🐨 export an action function here. You'll need the request and params from the DataFunctionArgs
//   🐨 Get the formData from the request (📜 https://mdn.io/request.formdata)
//   🐨 Get the title and content from the formData
//   🐨 update the note:
//   💰 here's how you can do it.
//      db.note.update({
//      	where: { id: { equals: params.noteId } },
//      	// @ts-expect-error 🦺 we'll fix this next...
//      	data: { title, content },
//      })
//   🐨 redirect the user back to the note's page

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()

	return (
		<Form
			method="post"
			className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
		>
			<div className="flex flex-col gap-4">
				<div>
					{/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
					<Label>Title</Label>
					<Input name="title" defaultValue={data.note.title} autoFocus />
				</div>
				<div>
					{/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
					<Label>Content</Label>
					<Textarea name="content" defaultValue={data.note.content} />
				</div>
			</div>
			<div className="floating-toolbar justify-end">
				<Button variant="destructive" type="reset">
					Reset
				</Button>
				<Button type="submit">Submit</Button>
			</div>
		</Form>
	)
}
