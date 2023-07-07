export default function NotesIndexRoute() {
	return (
		<div className="container pt-12">
			<p className="text-body-md">Select a note</p>
		</div>
	)
}

// 🐨 Create a meta export here

// 🦺 If you want it to be typed, then add a type for the loaders to the
// V2_MetaFunction generic. You can use null for the first argument (no loader).
// And for the second, you use an object mapping the ID to that route's loader's
// type. It's ID is `routes/users+/$username_+/notes` and you can import the
// notes loader from the parent route `./notes.tsx`
// 💰 { 'routes/users+/$username_+/notes': typeof notesLoader }
// 🦺 for this one, the loader is null, so you can pass that as the first
// generic argument to V2_MetaFunction

// 🐨 use the matches from the parameters to find the route for notes by that ID
// 💰 matches.find(m => m.id === 'routes/users+/$username_+/notes')

// 🐨 use this data to create the title and description that shows the user's
// name and the number of notes they have.

// 💯 handle pluralization of the word "note" in the description.
