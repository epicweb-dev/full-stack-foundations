import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '#app/utils/db.server.ts'

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
	// 💯 as an extra credit, you can try using the invariantResponse utility from
	// "#app/utils/misc.ts" to do this in a single line of code (just make sure to
	// supply the proper status code)
	// 🦺 then you can remove the @ts-expect-error below 🎉
	return json({
		// @ts-expect-error 🦺 we'll fix this next
		note: { title: note.title, content: note.content },
	})
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
		</div>
	)
}
