import { analyzeGuess } from './analyze';
import type { LetterStatus } from './analyze';
import { isValidWord, pickAnswer } from './words';
import { KEYBOARD_ROWS, MAX_GUESSES, MAX_LETTERS } from './settings';

export type GameStatus = 'playing' | 'win' | 'lose';

/** How "good" a status is for a key; the best status seen so far wins. */
const STATUS_RANK: Record<LetterStatus, number> = { new: 0, wrong: 1, close: 2, right: 3 };

/**
 * A game: its state, values derived from that state, and the actions that change it.
 * Components should only read these fields and call these actions.
 */
export class Game {
	answer = $state(pickAnswer());
	guesses = $state<string[]>([]);
	activeGuess = $state('');

	analyzedGuesses = $derived(this.guesses.map((guess) => analyzeGuess(guess, this.answer)));

	status = $derived<GameStatus>(
		this.guesses.includes(this.answer)
			? 'win'
			: this.guesses.length >= MAX_GUESSES
				? 'lose'
				: 'playing'
	);

	keyboardStatus = $derived.by(() => {
		const best: Record<string, LetterStatus> = {};
		for (const { char, status } of this.analyzedGuesses.flat()) {
			if (STATUS_RANK[status] > STATUS_RANK[best[char] ?? 'new']) best[char] = status;
		}
		return KEYBOARD_ROWS.map((row) =>
			[...row].map((char) => ({ char, status: best[char] ?? 'new' }))
		);
	});

	#typeLetter(letter: string) {
		this.activeGuess = (this.activeGuess + letter).substring(0, MAX_LETTERS);
	}

	#backspace() {
		this.activeGuess = this.activeGuess.substring(0, this.activeGuess.length - 1);
	}

	/** Submits the active guess, if it's a real word. */
	#submit() {
		if (!isValidWord(this.activeGuess)) return;
		this.guesses.push(this.activeGuess);
		this.activeGuess = '';
	}

	/**
	 * Handles a key from either the physical or on-screen keyboard.
	 * Accepts a KeyboardEvent.key value or an on-screen key (⏎ and ⌫).
	 * An arrow function so it can be passed around as a callback.
	 */
	pressKey = (key: string) => {
		if (this.status !== 'playing') return;
		if (key === 'Enter' || key === '⏎') this.#submit();
		else if (key === 'Backspace' || key === '⌫') this.#backspace();
		else if (/^[a-z]$/i.test(key)) this.#typeLetter(key.toLowerCase());
	};

	reset = () => {
		this.answer = pickAnswer();
		this.guesses = [];
		this.activeGuess = '';
	};
}
