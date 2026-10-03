/**
 * @typedef {'new' | 'close' | 'wrong' | 'right'} LetterStatus
 * @typedef {{ char: string, status: LetterStatus }} AnalyzedLetter
 */

/**
 * Scores each letter of a guess against the answer, wordle-style.
 *
 * - `right`: the same letter is in the same position in the answer.
 * - `close`: the letter is elsewhere in the answer. Each letter in the answer
 *   can only vouch for one letter of the guess, and exact matches claim theirs first.
 * - `wrong`: anything else.
 *
 * The guess and answer may be different lengths.
 *
 * @param {string} guess
 * @param {string} answer
 * @returns {AnalyzedLetter[]}
 */
export const analyzeGuess = (guess, answer) => {
	const letters = [...guess];

	/** @type {AnalyzedLetter[]} */
	const result = letters.map((char) => ({ char, status: 'wrong' }));

	// Answer letters not claimed by an exact match, as counts
	/** @type {Record<string, number>} */
	const unclaimed = {};
	[...answer].forEach((char, i) => {
		if (letters[i] !== char) unclaimed[char] = (unclaimed[char] ?? 0) + 1;
	});

	letters.forEach((char, i) => {
		if (answer[i] === char) {
			result[i].status = 'right';
		} else if (unclaimed[char] > 0) {
			unclaimed[char]--;
			result[i].status = 'close';
		}
	});

	return result;
};

/**
 * Hint about how the length of a guess compares to the answer.
 *
 * @param {string} guess
 * @param {string} answer
 * @returns {'short' | 'long' | 'same'}
 */
export const lengthHint = (guess, answer) => {
	if (guess.length < answer.length) return 'short';
	if (guess.length > answer.length) return 'long';
	return 'same';
};
