import { analyzeGuess, lengthHint } from './analyze';
import type { LengthHint, LetterStatus } from './analyze';

const LETTER_EMOJI: Record<LetterStatus, string> = {
	right: '🟩',
	close: '🟨',
	wrong: '⬛',
	new: '⬛'
};
const HINT_EMOJI: Record<LengthHint, string> = { short: '➡️', long: '⬅️', same: '🟢' };

/**
 * One line of emoji for a guess: a square per letter, then whether the length
 * was right (🟢), too short (➡️) or too long (⬅️), or 😃 if it was the answer.
 */
const emojiRow = (guess: string, answer: string): string => {
	const squares = analyzeGuess(guess, answer).map(({ status }) => LETTER_EMOJI[status]);
	const marker = guess === answer ? '😃' : HINT_EMOJI[lengthHint(guess, answer)];
	return squares.join('') + marker;
};

/**
 * Shareable, spoiler-free summary of a finished game.
 */
export const buildShareText = (guesses: string[], answer: string): string => {
	const title = `WormWord 👹 ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}`;
	return [title, '', ...guesses.map((guess) => emojiRow(guess, answer))].join('\n');
};
