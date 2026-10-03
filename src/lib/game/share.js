import { analyzeGuess, lengthHint } from './analyze';

const LETTER_EMOJI = { right: '🟩', close: '🟨', wrong: '⬛', new: '⬛' };
const HINT_EMOJI = { short: '➡️', long: '⬅️', same: '🟢' };

/**
 * One line of emoji for a guess: a square per letter, then whether the length
 * was right (🟢), too short (➡️) or too long (⬅️), or 😃 if it was the answer.
 *
 * @param {string} guess
 * @param {string} answer
 * @returns {string}
 */
const emojiRow = (guess, answer) => {
	const squares = analyzeGuess(guess, answer).map(({ status }) => LETTER_EMOJI[status]);
	const marker = guess === answer ? '😃' : HINT_EMOJI[lengthHint(guess, answer)];
	return squares.join('') + marker;
};

/**
 * Shareable, spoiler-free summary of a finished game.
 *
 * @param {string[]} guesses
 * @param {string} answer
 * @returns {string}
 */
export const buildShareText = (guesses, answer) => {
	const title = `WormWord 👹 ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}`;
	return [title, '', ...guesses.map((guess) => emojiRow(guess, answer))].join('\n');
};
