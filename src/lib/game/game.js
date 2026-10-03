import { writable, derived, get } from 'svelte/store';
import { analyzeGuess } from './analyze';
import { isValidWord, pickAnswer } from './words';
import { KEYBOARD_ROWS, MAX_LETTERS } from './settings';

/** @typedef {import('./analyze').LetterStatus} LetterStatus */

/** How "good" a status is for a key; the best status seen so far wins. */
const STATUS_RANK = { new: 0, wrong: 1, close: 2, right: 3 };

/**
 * Creates a game: its state, values derived from that state, and the actions
 * that change it. Components should only read these stores and call these actions.
 */
export const createGame = () => {
	const answer = writable(pickAnswer());
	const guesses = writable(/** @type {string[]} */ ([]));
	const activeGuess = writable('');

	const analyzedGuesses = derived([guesses, answer], ([$guesses, $answer]) =>
		$guesses.map((guess) => analyzeGuess(guess, $answer))
	);

	const status = derived([guesses, answer], ([$guesses, $answer]) =>
		$guesses.includes($answer) ? 'win' : 'playing'
	);

	const keyboardStatus = derived(analyzedGuesses, ($analyzedGuesses) => {
		/** @type {Record<string, LetterStatus>} */
		const best = {};
		for (const { char, status } of $analyzedGuesses.flat()) {
			if (STATUS_RANK[status] > STATUS_RANK[best[char] ?? 'new']) best[char] = status;
		}
		return KEYBOARD_ROWS.map((row) =>
			[...row].map((char) => ({ char, status: best[char] ?? 'new' }))
		);
	});

	const isPlaying = () => get(status) === 'playing';

	/** @param {string} letter */
	const typeLetter = (letter) => {
		if (!isPlaying()) return;
		activeGuess.update((g) => (g + letter).substring(0, MAX_LETTERS));
	};

	const backspace = () => {
		if (!isPlaying()) return;
		activeGuess.update((g) => g.substring(0, g.length - 1));
	};

	/** Submits the active guess, if it's a real word. */
	const submit = () => {
		const guess = get(activeGuess);
		if (!isPlaying() || !isValidWord(guess)) return;
		guesses.update((g) => [...g, guess]);
		activeGuess.set('');
	};

	/**
	 * Handles a key from either the physical or on-screen keyboard.
	 * Accepts a KeyboardEvent.key value or an on-screen key (⏎ and ⌫).
	 * @param {string} key
	 */
	const pressKey = (key) => {
		if (key === 'Enter' || key === '⏎') submit();
		else if (key === 'Backspace' || key === '⌫') backspace();
		else if (/^[a-z]$/i.test(key)) typeLetter(key.toLowerCase());
	};

	const reset = () => {
		answer.set(pickAnswer());
		guesses.set([]);
		activeGuess.set('');
	};

	return {
		answer: { subscribe: answer.subscribe },
		guesses: { subscribe: guesses.subscribe },
		activeGuess: { subscribe: activeGuess.subscribe },
		analyzedGuesses,
		keyboardStatus,
		status,
		pressKey,
		reset
	};
};
