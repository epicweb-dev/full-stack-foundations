/**
 * Don't worry too much about this file. It's just an in-memory "database"
 * for the purposes of our workshop. The data modeling workshop will cover
 * the proper database.
 */
import { factory, manyOf, nullable, oneOf, primaryKey } from '@mswjs/data'
import crypto from 'crypto'
import { singleton } from './singleton.server.ts'

const getId = () => crypto.randomBytes(16).toString('hex').slice(0, 8)

export const db = singleton('db', () => {
	const db = factory({
		user: {
			id: primaryKey(getId),
			email: String,
			username: String,
			name: nullable(String),

			createdAt: () => new Date(),

			notes: manyOf('note'),
		},
		note: {
			id: primaryKey(getId),
			title: String,
			content: String,

			createdAt: () => new Date(),

			owner: oneOf('user'),
		},
	})

	const kody = db.user.create({
		id: '9d6eba59daa2fc2078cf8205cd451041',
		email: 'kody@kcd.dev',
		username: 'kody',
		name: 'Kody',
	})
	const kodyNotes = [
		{
			title: 'Basic Koala Facts',
			content:
				'Koalas are found in the eucalyptus forests of eastern Australia. They have grey fur with a cream-coloured chest, and strong, clawed feet, perfect for living in the branches of trees!',
		},
		{
			title: 'Koalas like to cuddle',
			content:
				'Cuddly critters, koalas measure about 60cm to 85cm long, and weigh about 14kg.',
		},
		{
			title: 'Not bears',
			content:
				"Although you may have heard people call them koala 'bears', these awesome animals aren’t bears at all – they are in fact marsupials. A group of mammals, most marsupials have pouches where their newborns develop.",
		},
	]
	for (const note of kodyNotes) {
		db.note.create({
			...note,
			owner: kody,
		})
	}

	return db
})
