export type LetterStatus = 'new' | 'close' | 'wrong' | 'right';
export type AnalyzedLetter = { char: string; status: LetterStatus };

/**
 * Scores each letter of a guess against the answer, wordle-style.
 *
 * - `right`: the same letter is in the same position in the answer.
 * - `close`: the letter is elsewhere in the answer. Each letter in the answer
 *   can only vouch for one letter of the guess, and exact matches claim theirs first.
 * - `wrong`: anything else.
 *
 * The guess and answer may be different lengths.
 */
export const analyzeGuess = (guess: string, answer: string): AnalyzedLetter[] => {
	const letters = [...guess];

	const result: AnalyzedLetter[] = letters.map((char) => ({ char, status: 'wrong' }));

	// Answer letters not claimed by an exact match, as counts
	const unclaimed: Record<string, number> = {};
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

export type LengthHint = 'short' | 'long' | 'same';

/** Hint about how the length of a guess compares to the answer. */
export const lengthHint = (guess: string, answer: string): LengthHint => {
	if (guess.length < answer.length) return 'short';
	if (guess.length > answer.length) return 'long';
	return 'same';
};
