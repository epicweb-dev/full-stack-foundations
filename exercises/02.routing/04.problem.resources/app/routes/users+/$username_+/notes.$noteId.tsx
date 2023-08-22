import { useParams } from '@remix-run/react'

export default function NoteRoute() {
	const params = useParams()
	return (
		<div className="container pt-12 border-8 border-red-500">
			<h2 className="text-h2">{params.noteId}</h2>
		</div>
	)
}
