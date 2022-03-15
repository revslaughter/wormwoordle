<script>
	import { slide } from 'svelte/transition';
	import Letter from '$lib/components/Letter.svelte';
	import { gameScore } from '$lib/util/store/score';
	import SETTINGS from '$lib/util/store/settings';
	import { activeGuess } from '$lib/util/store/gameStatus';

	const MAX_LETTERS = SETTINGS.MAX_LETTERS;

	/**
	 * Pads a row with dead letter cells until we reach the end.
	 *
	 * @param {Array<any>} inArray
	 */
	let padWithDeath = (array) => {
		let copy = [...array];
		while (copy.length < MAX_LETTERS) {
			copy.push({ char: '', status: 'dead' });
		}
		return copy;
	};

	$: displayLetters = [...$activeGuess].map((w) => ({ char: w, status: 'new' }));
	$: analysis = padWithDeath(displayLetters);
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Backspace') {
			$activeGuess = $activeGuess.substring(0, $activeGuess.length - 1);
		} else if (event.code.startsWith('Key')) {
			$activeGuess = ($activeGuess + event.key).substring(0, SETTINGS.MAX_LETTERS);
		}
	}}
/>

<div class="wordRow">
	{#each analysis as guessLetter}
		<Letter char={guessLetter.char} status={guessLetter.status} />
	{/each}
	<Letter char={$gameScore} status="score" />
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

		grid-template-columns: repeat(11, 11fr);
	}
</style>
