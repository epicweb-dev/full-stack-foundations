async function main() {
	const { $ } = await import('execa')
	await $`cp -rf ../exercises/01.styling/01.solution.public-links ./tests`
}
main()
