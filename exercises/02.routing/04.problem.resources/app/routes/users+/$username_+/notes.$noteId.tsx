import { useParams } from '@remix-run/react'

export default function NoteRoute() {
	const params = useParams()
	return <h2 className="text-h2">{params.noteId}</h2>
}
