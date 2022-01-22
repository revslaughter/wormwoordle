<script>
	import Letter from '$lib/Letter.svelte';

	export let guess = '';
	export let word = 'wormy';

	const MAX_LETTERS = 10;
	const range = [...Array(MAX_LETTERS).keys()]; // [0,1,2,...,MAX_LETTERS]

	const LONGER_SHORTER = eval_shorter();

	function eval_shorter() {
		if (guess.length == word.length && guess !== word) return '⸱';
		if (guess.length == word.length && guess === word) return '😃';
		else return guess.length < word.length ? '⇢' : '⇠';
	}

	function getLetter(idx) {
		if (idx === guess.length) return LONGER_SHORTER;

		return guess[idx] ?? '';
	}

	function letterStatus(idx) {
		if (guess[idx] === undefined || guess[idx] === null) return '';
		// check to see if in the right position
		if (guess[idx] === word[idx]) return 'right';
		if (word.includes(guess[idx])) return 'close';
		if (!word.includes(guess[idx])) return 'wrong';
	}
</script>

<div class="wordRow">
	{#each range as ix}
		<Letter char={getLetter(ix)} status={letterStatus(ix)} />
	{/each}
</div>

<style>
	.wordRow {
		width: 80%;
		max-width: 725px;

		margin-top: 0.5em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 0.5em;

		display: grid;
		gap: 2px;

		grid-template-columns: repeat(10, 10fr);
	}
</style>
