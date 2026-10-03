import { analyzeGuess } from './analyze';
import type { LetterStatus } from './analyze';
import type { WordSource } from './words';
import { noStore, type GameMode, type GameStore } from './savedGame';
import { dailyRandom, dateKey } from './daily';
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
	/** Whether this is the word of the day or a random practice word. */
	mode = $state<GameMode>('daily');
	/** The date this game belongs to (see `dateKey`). */
	day = $state('');
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

	/** Losing the word of the day ends it until tomorrow; any other finished game can be replayed. */
	canPlayAgain = $derived(
		this.status === 'win' || (this.status === 'lose' && this.mode === 'practice')
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
	#store: GameStore;
	#today: () => string;
	#checking = false;
	#loads = 0;

	constructor(words: WordSource, store: GameStore = noStore, today: () => string = dateKey) {
		this.#words = words;
		this.#store = store;
		this.#today = today;
	}

	#save() {
		this.#store.save({
			mode: this.mode,
			day: this.day,
			answer: this.answer,
			guesses: $state.snapshot(this.guesses)
		});
	}

	/**
	 * Picks up today's saved game, or loads a new one if there isn't one: the word of the day.
	 * Call once the game is on screen (it reads storage and fetches the word list).
	 */
	start = async () => {
		const today = this.#today();
		const saved = this.#store.load();
		if (saved?.day === today) {
			++this.#loads;
			this.mode = saved.mode;
			this.day = saved.day;
			this.answer = saved.answer;
			this.guesses = saved.guesses;
			return;
		}
		await this.#load('daily', today);
	};

	/** Loads a new answer: the word of `day` for everyone, or a random one for practice. */
	async #load(mode: GameMode, day: string) {
		const load = ++this.#loads;
		try {
			const answer = await this.#words.pickAnswer(mode === 'daily' ? dailyRandom(day) : undefined);
			if (load !== this.#loads) return;
			this.mode = mode;
			this.day = day;
			this.answer = answer;
			this.#save();
		} catch {
			if (load === this.#loads) this.notice = "Couldn't load the word list. Reload to try again.";
		}
	}

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
				this.#save();
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

	#clear() {
		this.answer = '';
		this.guesses = [];
		this.activeGuess = '';
		this.notice = '';
		this.#store.clear();
	}

	/** Starts a random practice game, once the current one is won (or a practice game is lost). */
	playAgain = async () => {
		if (!this.canPlayAgain) return;
		this.#clear();
		await this.#load('practice', this.#today());
	};

	/**
	 * Moves on to the new word of the day if the date has changed, e.g. when a tab left open
	 * overnight is looked at again. A practice game in progress is left alone.
	 */
	refreshDay = async () => {
		const today = this.#today();
		if (this.day === '' || this.day === today) return;
		if (this.mode === 'practice' && this.status === 'playing') return;
		this.#clear();
		await this.#load('daily', today);
	};
}
