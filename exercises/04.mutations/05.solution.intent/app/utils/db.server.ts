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
			id: 'd27a197e',
			title: 'Basic Koala Facts',
			content:
				'Koalas are found in the eucalyptus forests of eastern Australia. They have grey fur with a cream-coloured chest, and strong, clawed feet, perfect for living in the branches of trees!',
		},
		{
			id: '414f0c09',
			title: 'Koalas like to cuddle',
			content:
				'Cuddly critters, koalas measure about 60cm to 85cm long, and weigh about 14kg.',
		},
		{
			id: '260366b1',
			title: 'Not bears',
			content:
				"Although you may have heard people call them koala 'bears', these awesome animals aren’t bears at all – they are in fact marsupials. A group of mammals, most marsupials have pouches where their newborns develop.",
		},
		{
			id: 'bb79cf45',
			title: 'Snowboarding Adventure',
			content:
				"Today was an epic day on the slopes! Shredded fresh powder with my friends, caught some sick air, and even attempted a backflip. Can't wait for the next snowy adventure!",
		},
		{
			id: '9f4308be',
			title: 'Onewheel Tricks',
			content:
				"Mastered a new trick on my Onewheel today called '180 Spin'. It's exhilarating to carve through the streets while pulling off these rad moves. Time to level up and learn more!",
		},
		{
			id: '306021fb',
			title: 'Coding Dilemma',
			content:
				"Stuck on a bug in my latest coding project. Need to figure out why my function isn't returning the expected output. Time to dig deep, debug, and conquer this challenge!",
		},
		{
			id: '16d4912a',
			title: 'Coding Mentorship',
			content:
				"Had a fantastic coding mentoring session today with Sarah. Helped her understand the concept of recursion, and she made great progress. It's incredibly fulfilling to help others improve their coding skills.",
		},
		{
			id: '3199199e',
			title: 'Koala Fun Facts',
			content:
				"Did you know that koalas sleep for up to 20 hours a day? It's because their diet of eucalyptus leaves doesn't provide much energy. But when I'm awake, I enjoy munching on leaves, chilling in trees, and being the cuddliest koala around!",
		},
		{
			id: '2030ffd3',
			title: 'Skiing Adventure',
			content:
				'Spent the day hitting the slopes on my skis. The fresh powder made for some incredible runs and breathtaking views. Skiing down the mountain at top speed is an adrenaline rush like no other!',
		},
		{
			id: 'f375a804',
			title: 'Code Jam Success',
			content:
				'Participated in a coding competition today and secured the first place! The adrenaline, the challenging problems, and the satisfaction of finding optimal solutions—it was an amazing experience. Feeling proud and motivated to keep pushing my coding skills further!',
		},
		{
			id: '562c541b',
			title: 'Koala Conservation Efforts',
			content:
				"Joined a local conservation group to protect koalas and their habitats. Together, we're planting more eucalyptus trees, raising awareness about their endangered status, and working towards a sustainable future for these adorable creatures. Every small step counts!",
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
