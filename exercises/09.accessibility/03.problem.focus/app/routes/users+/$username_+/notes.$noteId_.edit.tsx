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

function ErrorList({
	id,
	errors,
}: {
	id?: string
	errors?: Array<string> | null
}) {
	return errors?.length ? (
		<ul id={id} className="flex flex-col gap-1">
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
	// 🐨 create a ref for the form element
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

	const formHasErrors = Boolean(formErrors?.length)
	const formErrorId = formHasErrors ? 'form-error' : undefined
	const titleHasErrors = Boolean(fieldErrors?.title.length)
	const titleErrorId = titleHasErrors ? 'title-error' : undefined
	const contentHasErrors = Boolean(fieldErrors?.content.length)
	const contentErrorId = contentHasErrors ? 'content-error' : undefined

	// 🐨 add a useEffect that focuses on the first element in the form that
	// has an error whenever the actionData changes
	//   (💰 so the dependency array should include the actionData).
	// 💰 we only care to focus on an element if:
	// - the formRef.current is truthy
	// - the actionData has errors
	// 🐨 if the formRef.current matches the query [aria-invalid="true"] then
	// focus on the form otherwise, check formRef.current.elements and focus on
	// the first element that matches the query [aria-invalid="true"]
	// 📜 https://mdn.io/element.matches

	return (
		<Form
			noValidate={isHydrated}
			method="post"
			className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
			aria-invalid={formHasErrors || undefined}
			aria-describedby={formErrorId}
			// 🐨 add the form ref prop here
			// 📜 https://react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref
			// 🐨 add a tabIndex={-1} here so we can programmatically focus on the form
			// 📜 https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
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
						aria-invalid={titleHasErrors || undefined}
						aria-describedby={titleErrorId}
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList id={titleErrorId} errors={fieldErrors?.title} />
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
						aria-invalid={contentHasErrors || undefined}
						aria-describedby={contentErrorId}
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList id={contentErrorId} errors={fieldErrors?.content} />
					</div>
				</div>
			</div>
			<ErrorList id={formErrorId} errors={formErrors} />
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
