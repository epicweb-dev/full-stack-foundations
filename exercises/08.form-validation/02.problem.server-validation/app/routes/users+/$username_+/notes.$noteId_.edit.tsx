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

	// 🐨 create an errors object here
	// 🐨 validate the requirements for the title and content and add any errors
	// to the errors object
	// 🐨 if there are any errors, then return a json response with the errors
	// and a 400 status code

	db.note.update({
		where: { id: { equals: params.noteId } },
		data: { title, content },
	})

	return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

// 🐨 this is a good place to stick the ErrorList component if you want to use that

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()
	// 🐨 get the actionData from useActionData here
	const navigation = useNavigation()
	const formAction = useFormAction()
	const isSubmitting =
		navigation.state !== 'idle' &&
		navigation.formMethod === 'post' &&
		navigation.formAction === formAction

	// 🐨 get the fieldErrors here from the actionData

	return (
		<Form
			// 🐨 to test out the server-side validation, you need to disable the
			// client-side validation. You can do that by adding:
			// noValidate
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
					{/* 🐨 add the title error messages here */}
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
					{/* 🐨 add content the error messages here */}
				</div>
			</div>
			{/* 🐨 add the form error messages here */}
			{/*
				🦉 even though we don't really have form messages, we're going to
				have you do it anyway so you can see how it works and to maintain
				consistency with the codebase.

				💯 If you've got extra time, think of an error you could have that would
				be at the form level (like, maybe your content must include a word from
				the title or something like that)
			*/}
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
