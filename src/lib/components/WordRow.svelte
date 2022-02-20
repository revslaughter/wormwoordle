<script>
	import Letter from '$lib/components/Letter.svelte';
	import { storeAnswer } from '$lib/util/store/chooseWord';
	import { analyze } from '$lib/util/analyzeWord';
	import SETTINGS from '$lib/util/store/settings';
	import { scoreGuess } from '$lib/util/store/score';
	import { analyzedGuesses, guesses } from '$lib/util/store/gameStatus';

	export let guess = '';
	export let tryCount = 0;

	let score = 0;

	const MAX_LETTERS = SETTINGS.MAX_LETTERS;
	const INDICATOR = eval_shorter();

	function eval_shorter() {
		if (guess.length == $storeAnswer.length && guess !== $storeAnswer) {
			score++;
			return '⸱';
		}
		if (guess.length == $storeAnswer.length && guess === $storeAnswer) return '😃';
		else return guess.length < $storeAnswer.length ? '⇢' : '⇠';
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

	let analysis = padWithDeathAndIndicator(analyze(guess, $storeAnswer));
	score += scoreGuess(analysis);
	score = tryCount > score ? 0 : score - tryCount;
</script>

<div class="wordRow">
	{#each analysis as guessLetter}
		<Letter char={guessLetter.char} status={guessLetter.status} />
	{/each}
	<Letter char={score} status="score" />
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
