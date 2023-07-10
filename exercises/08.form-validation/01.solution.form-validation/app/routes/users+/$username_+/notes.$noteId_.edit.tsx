import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import {
	Form,
	useFormAction,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { floatingToolbarClassName } from '~/components/floating-toolbar.tsx'
import { Button } from '~/components/ui/button.tsx'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import { StatusButton } from '~/components/ui/status-button.tsx'
import { Textarea } from '~/components/ui/textarea.tsx'
import { db } from '~/utils/db.server.ts'
import { invariantResponse } from '~/utils/misc.ts'

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
	const title = formData.get('title')
	const content = formData.get('content')
	invariantResponse(typeof title === 'string', 'title must be a string')
	invariantResponse(typeof content === 'string', 'content must be a string')

	db.note.update({
		where: { id: { equals: params.noteId } },
		data: { title, content },
	})

	return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()
	const navigation = useNavigation()
	const formAction = useFormAction()
	const isSubmitting =
		navigation.state !== 'idle' &&
		navigation.formMethod === 'post' &&
		navigation.formAction === formAction

	return (
		<Form
			method="post"
			className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
		>
			<div className="flex flex-col gap-1">
				<div>
					{/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
					<Label>Title</Label>
					<Input
						name="title"
						defaultValue={data.note.title}
						required
						minLength={1}
						maxLength={100}
					/>
				</div>
				<div>
					{/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
					<Label>Content</Label>
					<Textarea
						name="content"
						defaultValue={data.note.content}
						required
						minLength={1}
						maxLength={10000}
					/>
				</div>
			</div>
			<div className={floatingToolbarClassName}>
				<Button variant="destructive" type="reset">
					Reset
				</Button>
				<StatusButton
					type="submit"
					disabled={isSubmitting}
					status={isSubmitting ? 'pending' : 'idle'}
				>
					Submit
				</StatusButton>
			</div>
		</Form>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
