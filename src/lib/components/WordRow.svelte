<script>
	import Letter from '$lib/components/Letter.svelte';
	import { MAX_LETTERS } from '$lib/game/settings';

	/** @type {import('$lib/game/analyze').AnalyzedLetter[]} */
	export let letters = [];
	/** How the word's length compares to the answer. Omit for a row still being typed. */
	/** @type {'short' | 'long' | 'same' | undefined} */
	export let hint = undefined;

	$: solved = letters.length > 0 && letters.every((l) => l.status === 'right');

	$: indicator = hint === 'short' ? '⇢' : hint === 'long' ? '⇠' : solved ? '😃' : '⸱';

	$: cells = [
		...letters,
		...(hint && letters.length < MAX_LETTERS ? [{ char: indicator, status: 'new' }] : [])
	];
	$: padding = Math.max(0, MAX_LETTERS - cells.length);
</script>

<div class="wordRow">
	{#each cells as { char, status }}
		<Letter {char} {status} />
	{/each}
	{#each { length: padding } as _}
		<Letter />
	{/each}
</div>

<style>
	.wordRow {
		width: 95%;
		max-width: 30em;

		margin-top: 0.5em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 0.5em;

		display: grid;
		gap: 2px;

		align-items: center;

		grid-template-columns: repeat(10, 10fr);
	}
</style>
