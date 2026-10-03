<script lang="ts">
	import Letter from '#lib/components/Letter.svelte';
	import type { AnalyzedLetter, LengthHint } from '#lib/game/analyze';
	import { MAX_LETTERS } from '#lib/game/settings';

	interface Props {
		letters?: AnalyzedLetter[];
		/** How the word's length compares to the answer. Omit for a row still being typed. */
		hint?: LengthHint;
	}

	let { letters = [], hint }: Props = $props();

	const solved = $derived(letters.length > 0 && letters.every((l) => l.status === 'right'));

	const indicator = $derived(hint === 'short' ? '⇢' : hint === 'long' ? '⇠' : solved ? '😃' : '⸱');

	const cells = $derived([
		...letters,
		...(hint && letters.length < MAX_LETTERS
			? [{ char: indicator, status: 'new' } as AnalyzedLetter]
			: [])
	]);
	const padding = $derived(Math.max(0, MAX_LETTERS - cells.length));
</script>

<div class="wordRow">
	{#each cells as { char, status }, i (i)}
		<Letter {char} {status} />
	{/each}
	{#each { length: padding }, i (i)}
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
