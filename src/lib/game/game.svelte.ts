import { analyzeGuess } from './analyze';
import type { LetterStatus } from './analyze';
import type { WordSource } from './words';
import { KEYBOARD_ROWS, MAX_GUESSES, MAX_LETTERS } from './settings';

export type GameStatus = 'playing' | 'win' | 'lose';

/** How "good" a status is for a key; the best status seen so far wins. */
const STATUS_RANK: Record<LetterStatus, number> = { new: 0, wrong: 1, close: 2, right: 3 };

/**
 * A game: its state, values derived from that state, and the actions that change it.
 * Components should only read these fields and call these actions.
 */
export class Game {
	/** The word to find. Empty until `start()` has loaded one. */
	answer = $state('');
	guesses = $state<string[]>([]);
	activeGuess = $state('');

	/** Whether an answer has been loaded, i.e. the game can be played. */
	ready = $derived(this.answer !== '');

	/** Feedback about the last action, e.g. a rejected guess. Cleared on the next key press. */
	notice = $state('');

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

	#words: WordSource;
	#checking = false;
	#loads = 0;

	constructor(words: WordSource) {
		this.#words = words;
	}

	/** Loads an answer. Call once the game is on screen (it fetches the word list). */
	start = async () => {
		const load = ++this.#loads;
		try {
			const answer = await this.#words.pickAnswer();
			if (load === this.#loads) this.answer = answer;
		} catch {
			if (load === this.#loads) this.notice = "Couldn't load the word list. Reload to try again.";
		}
	};

	#typeLetter(letter: string) {
		this.activeGuess = (this.activeGuess + letter).substring(0, MAX_LETTERS);
	}

	#backspace() {
		this.activeGuess = this.activeGuess.substring(0, this.activeGuess.length - 1);
	}

	/** Submits the active guess, if it's a real word. */
	async #submit() {
		const guess = this.activeGuess;
		if (guess === '' || this.#checking) return;
		const answer = this.answer;
		this.#checking = true;
		try {
			const valid = await this.#words.isValid(guess);
			// The player may have edited the guess or started over while we were checking
			if (this.answer !== answer || this.activeGuess !== guess) return;
			if (valid) {
				this.guesses.push(guess);
				this.activeGuess = '';
			} else {
				this.notice = 'Not in the word list';
			}
		} catch {
			if (this.answer === answer && this.activeGuess === guess) {
				this.notice = "Couldn't check that word. Try again.";
			}
		} finally {
			this.#checking = false;
		}
	}

	/**
	 * Handles a key from either the physical or on-screen keyboard.
	 * Accepts a KeyboardEvent.key value or an on-screen key (⏎ and ⌫).
	 * An arrow function so it can be passed around as a callback.
	 */
	pressKey = async (key: string) => {
		if (!this.ready || this.status !== 'playing') return;
		this.notice = '';
		if (key === 'Enter' || key === '⏎') await this.#submit();
		else if (key === 'Backspace' || key === '⌫') this.#backspace();
		else if (/^[a-z]$/i.test(key)) this.#typeLetter(key.toLowerCase());
	};

	reset = async () => {
		this.answer = '';
		this.guesses = [];
		this.activeGuess = '';
		this.notice = '';
		await this.start();
	};
}
