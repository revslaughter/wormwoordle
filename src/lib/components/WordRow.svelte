<script>
	import Letter from '$lib/components/Letter.svelte';
	import { storeAnswer } from '$lib/util/store/chooseWord';
	import SETTINGS from '$lib/util/store/settings';

	export let guess = '';
	export let tryCount = 0;

	let score = 0;

	const MAX_LETTERS = SETTINGS.MAX_LETTERS;
	const INDICATOR = eval_shorter();

	function eval_shorter() {
		if (status === 'active') return '';
		if (guess.length == $storeAnswer.length && guess !== $storeAnswer) {
			score++;
			return '⸱';
		}
		if (guess.length == $storeAnswer.length && guess === $storeAnswer) return '😃';
		else return guess.length < $storeAnswer.length ? '⇢' : '⇠';
	}

	/**
	 * Return an array of all the indices of a character given a word.
	 *
	 * example:
	 *
	 * ```js
	 * getIndiciesForCharacter('t', 'test') -> [0,3]
	 * ```
	 *
	 * @param {string} char A string of length one
	 * @param {string} str
	 * @returns {number[]}
	 */
	function getIndiciesForCharacter(char, str) {
		let matches = str.matchAll(new RegExp(char, 'g'));

		//make into array and get the indicies
		let indicesBack = [...matches].map((m) => m.index);

		return indicesBack;
	}

	/**
	 * Find the common elements of an array and return it
	 *
	 * example:
	 *
	 * ```js
	 * intersect([0,2,4,6,8], [4,8,12]) -> [4,8]
	 * ```
	 *
	 * @param {Array<number>} oneArray
	 * @param {Array<number>} twoArray
	 * @returns {Array<number>} The common elements of the arrays
	 */
	let intersect = (oneArray, twoArray) => oneArray.filter((x) => twoArray.includes(x));

	/**
	 * This provides an object that has the characters and status of each character.
	 * It's kind of a nightmare, and should probably be refactored.
	 * @param {string} word
	 * @param {string} comparison
	 */
	let analyze = (word, comparison) =>
		[...word]
			.map((c, i) => ({
				char: c,
				index: i,
				allIx: getIndiciesForCharacter(c, word),
				compIx: getIndiciesForCharacter(c, comparison)
			}))
			.map((item) => ({ ...item, intersection: intersect(item.allIx, item.compIx) }))
			.map((item) => {
				let status = 'wrong';
				if (item.intersection.includes(item.index)) {
					score += 3;
					status = 'right';
				} else if (item.compIx.length >= item.allIx.length) {
					score += 1;
					status = 'close';
				} else if (item.compIx.length < item.allIx.length) {
					// what letter is this?
					// e.g.:
					//         index = 3
					//         allIx = [2,3,4,5] <-- 3 is the second letter
					//        compIx = [1,2] <------ the second letter is the last occurence
					// intertsection = [2]
					// 2 should be right, but 3 should be close, and 4 and 5 should be wrong
					let thisIsNumber = item.allIx.indexOf(item.index);
					if (thisIsNumber + 1 > item.compIx.length - item.intersection.length) {
						status = 'wrong';
					} else {
						status = 'close';
					}
				}
				return { ...item, status };
			});

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

	/**
	 * If this is a display, put the statuses on each letter via `analyze`,
	 * otherwise this will be the current guess.
	 */
	let displayLetters = analyze(guess, $storeAnswer);

	let analysis = padWithDeathAndIndicator(displayLetters);
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
