<script>
	import Letter from '$lib/Letter.svelte';

	export let guess = '';
	export let answer = 'abscess';

	const MAX_LETTERS = 10;
	const range = [...Array(MAX_LETTERS).keys()]; // [0,1,2,...,MAX_LETTERS]

	const INDICATOR = eval_shorter();

	function eval_shorter() {
		if (guess.length == answer.length && guess !== answer) return '⸱';
		if (guess.length == answer.length && guess === answer) return '😃';
		else return guess.length < answer.length ? '⇢' : '⇠';
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
					status = 'right';
				} else if (item.compIx.length >= item.allIx.length) {
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
	 *
	 * @param {Array<any>} inArray
	 */
	let padWithDeath = (array) => {
		let copy = [...array];
		if (copy.length < MAX_LETTERS) copy.push({ char: INDICATOR, status: 'new' });
		while (copy.length < MAX_LETTERS) {
			copy.push({ char: '', status: 'dead' });
		}
		return copy;
	};


	let analysis = padWithDeath(analyze(guess, answer));
	console.log(analysis);
</script>

<div class="wordRow">
	{#each analysis as guessLetter}
		<Letter char={guessLetter.char} status={guessLetter.status} />
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
