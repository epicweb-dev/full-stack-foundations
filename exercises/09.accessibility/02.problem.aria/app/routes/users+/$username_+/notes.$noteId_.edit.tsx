import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import {
	Form,
	useActionData,
	useFormAction,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
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

type ActionErrors = {
	formErrors: Array<string>
	fieldErrors: {
		title: Array<string>
		content: Array<string>
	}
}

const titleMinLength = 1
const titleMaxLength = 100
const contentMinLength = 1
const contentMaxLength = 10000

export async function action({ request, params }: DataFunctionArgs) {
	const formData = await request.formData()
	const title = formData.get('title')
	const content = formData.get('content')
	invariantResponse(typeof title === 'string', 'title must be a string')
	invariantResponse(typeof content === 'string', 'content must be a string')

	const errors: ActionErrors = {
		formErrors: [],
		fieldErrors: {
			title: [],
			content: [],
		},
	}

	if (title.length < titleMinLength) {
		errors.fieldErrors.title.push('Title must be at least 1 character')
	}
	if (title.length > titleMaxLength) {
		errors.fieldErrors.title.push('Title must be at most 100 characters')
	}
	if (content.length < contentMinLength) {
		errors.fieldErrors.content.push('Content must be at least 1 character')
	}
	if (content.length > contentMaxLength) {
		errors.fieldErrors.content.push('Content must be at most 10000 characters')
	}

	const hasErrors =
		errors.formErrors.length ||
		Object.values(errors.fieldErrors).some(fieldErrors => fieldErrors.length)
	if (hasErrors) {
		return json({ status: 'error', errors } as const, { status: 400 })
	}

	db.note.update({
		where: { id: { equals: params.noteId } },
		data: { title, content },
	})

	return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

// 🐨 the ErrorList needs to accept an "id" string and apply it to the <ul>
function ErrorList({ errors }: { errors?: Array<string> | null }) {
	return errors?.length ? (
		<ul className="flex flex-col gap-1">
			{errors.map((error, i) => (
				<li key={i} className="text-[10px] text-foreground-danger">
					{error}
				</li>
			))}
		</ul>
	) : null
}

function useHydrated() {
	const [hydrated, setHydrated] = useState(false)
	useEffect(() => setHydrated(true), [])
	return hydrated
}

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const formAction = useFormAction()
	const isSubmitting =
		navigation.state !== 'idle' &&
		navigation.formMethod === 'post' &&
		navigation.formAction === formAction

	const fieldErrors =
		actionData?.status === 'error' ? actionData.errors.fieldErrors : null
	const formErrors =
		actionData?.status === 'error' ? actionData.errors.formErrors : null
	const isHydrated = useHydrated()

	// 💰 you can create a couple variables here that will be useful below:
	// formHasErrors - a boolean if there are any errors for the form
	// formErrorId - a string that's the id for the form error or undefined if there are no errors
	// titleHasErrors - a boolean if there are any errors for the title
	// titleErrorId - a string that's the id for the title error or undefined if there are no errors
	// contentHasErrors - a boolean if there are any errors for the content
	// contentErrorId - a string that's the id for the content error or undefined if there are no errors

	return (
		<Form
			noValidate={isHydrated}
			method="post"
			className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
			// 🐨 add aria-invalid and aria-describedby here
		>
			<div className="flex flex-col gap-1">
				<div>
					<Label htmlFor="note-title">Title</Label>
					<Input
						id="note-title"
						name="title"
						defaultValue={data.note.title}
						required
						minLength={titleMinLength}
						maxLength={titleMaxLength}
						// 🐨 add aria-invalid and aria-describedby here
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						{/* 🐨 add the id here */}
						<ErrorList errors={fieldErrors?.title} />
					</div>
				</div>
				<div>
					<Label htmlFor="note-content">Content</Label>
					<Textarea
						id="note-content"
						name="content"
						defaultValue={data.note.content}
						required
						minLength={contentMinLength}
						maxLength={contentMaxLength}
						// 🐨 add aria-invalid and aria-describedby here
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						{/* 🐨 add the id here */}
						<ErrorList errors={fieldErrors?.content} />
					</div>
				</div>
			</div>
			{/* 🐨 add the form's error id here */}
			<ErrorList errors={formErrors} />
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
