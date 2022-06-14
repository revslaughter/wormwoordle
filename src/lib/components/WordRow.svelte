<script>
	import { blur, fly } from 'svelte/transition';

	import Letter from '$lib/components/Letter.svelte';
	import { storeAnswer } from '$lib/util/store/chooseWord';
	import SETTINGS from '$lib/util/store/settings';
	import { winStatus } from '$lib/util/store/gameStatus';

	export let guess = [{}];
	export let tryCount = 0;


	let isRight = guess.every((l) => l.status === 'right');

	const MAX_LETTERS = SETTINGS.MAX_LETTERS;
	const INDICATOR = eval_shorter();

	function eval_shorter() {
		if (guess.length == $storeAnswer.length && !isRight) {
			return '⸱';
		}
		if (guess.length == $storeAnswer.length && isRight) {
			$winStatus = 'win';
			return '😃';
		} else return guess.length < $storeAnswer.length ? '⇢' : '⇠';
	}

	/**
	 * Pads a row with dead letter cells until we reach the end.
	 *
	 * @param {Array<any>} inArray
	 */
	let padWithDeathAndIndicator = (array) => {
		let copy = [...array];
		if (copy.length < MAX_LETTERS) copy.push({ char: INDICATOR, status: 'new' });
		while (copy.length < MAX_LETTERS) {
			copy.push({ char: '', status: 'dead' });
		}
		return copy;
	};

	let analysis = padWithDeathAndIndicator(guess);
</script>

{@debug $storeAnswer}

<div class="wordRow" in:blur={{ duration: 400 }}>
	{#each analysis as guessLetter}
		<Letter char={guessLetter.char} status={guessLetter.status} />
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
