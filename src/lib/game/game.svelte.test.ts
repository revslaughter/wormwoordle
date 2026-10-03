import { describe, it, expect, beforeEach, vi } from 'vitest';
import wordList from '../../../data/2of12inf.json';
import { Game } from './game.svelte';
import type { WordSource } from './words';
import { noStore } from './savedGame';
import type { GameStore, SavedGame } from './savedGame';

const words = new Set(wordList);

/** A word source backed by the real list, with the answers handed out in order. */
const fakeSource = (answers: string[]): WordSource => ({
	isValid: async (word) => words.has(word),
	pickAnswer: async () => answers.shift() ?? 'worm'
});

/** A promise you resolve from outside, to hold an async step open. */
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (error: Error) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const type = (game: Game, text: string) => [...text].forEach((c) => game.pressKey(c));
const guess = async (game: Game, word: string) => {
	type(game, word);
	await game.pressKey('Enter');
};

/** A store that keeps the saved game in memory, so tests can look at it. */
const DAY = '2026-10-03';
const today = () => DAY;

const memoryStore = (initial: SavedGame | null = null) => {
	const store: GameStore & { saved: SavedGame | null } = {
		saved: initial,
		load: () => store.saved,
		save: (game) => void (store.saved = game),
		clear: () => void (store.saved = null)
	};
	return store;
};

let game: Game;
beforeEach(async () => {
	game = new Game(fakeSource(['worm']));
	await game.start();
});

describe('loading', () => {
	it('is not ready until the answer has loaded, and ignores keys until then', async () => {
		const answer = deferred<string>();
		const slow = new Game({ isValid: async () => true, pickAnswer: () => answer.promise });
		const started = slow.start();
		expect(slow.ready).toBe(false);
		type(slow, 'cat');
		expect(slow.activeGuess).toBe('');
		answer.resolve('worm');
		await started;
		expect(slow.ready).toBe(true);
		expect(slow.answer).toBe('worm');
		type(slow, 'cat');
		expect(slow.activeGuess).toBe('cat');
	});

	it('says so when the word list cannot be loaded, and stays unplayable', async () => {
		const broken = new Game({
			isValid: async () => true,
			pickAnswer: async () => {
				throw new Error('offline');
			}
		});
		await broken.start();
		expect(broken.ready).toBe(false);
		expect(broken.notice).toMatch(/couldn't load the word list/i);
	});

	it('uses only the latest answer when started twice', async () => {
		const first = deferred<string>();
		const picks = [first.promise, Promise.resolve('dog')];
		const racing = new Game({ isValid: async () => true, pickAnswer: () => picks.shift()! });
		const slowStart = racing.start();
		await racing.start();
		first.resolve('cat');
		await slowStart;
		expect(racing.answer).toBe('dog');
	});
});

describe('typing', () => {
	it('builds up the active guess, lowercased', () => {
		type(game, 'WoR');
		expect(game.activeGuess).toBe('wor');
	});

	it('ignores keys that are not letters', () => {
		['1', ' ', 'Shift', 'ArrowLeft', 'é'].forEach((k) => game.pressKey(k));
		expect(game.activeGuess).toBe('');
	});

	it('stops at the maximum length', () => {
		type(game, 'abcdefghijklmnop');
		expect(game.activeGuess).toBe('abcdefghij');
	});

	it('backspaces from either keyboard, and is safe when empty', () => {
		type(game, 'wor');
		game.pressKey('Backspace');
		game.pressKey('⌫');
		expect(game.activeGuess).toBe('w');
		game.pressKey('⌫');
		game.pressKey('⌫');
		expect(game.activeGuess).toBe('');
	});
});

describe('submitting', () => {
	it('accepts a real word from either keyboard', async () => {
		await guess(game, 'cat');
		type(game, 'dog');
		await game.pressKey('⏎');
		expect(game.guesses).toEqual(['cat', 'dog']);
		expect(game.activeGuess).toBe('');
	});

	it('rejects a non-word and keeps what was typed', async () => {
		await guess(game, 'zzzzzz');
		expect(game.guesses).toEqual([]);
		expect(game.activeGuess).toBe('zzzzzz');
	});

	it('does nothing on an empty guess', async () => {
		await game.pressKey('Enter');
		expect(game.guesses).toEqual([]);
	});

	it('analyzes each guess against the answer', async () => {
		await guess(game, 'wore');
		expect(game.analyzedGuesses[0].map((l) => l.status)).toEqual([
			'right',
			'right',
			'right',
			'wrong'
		]);
	});

	describe('while a word is being checked', () => {
		/** A game whose word check stays open until the test lets it finish. */
		const slowCheck = async () => {
			const check = deferred<boolean>();
			const checks: string[] = [];
			const clock = { day: '2026-10-03' };
			const slow = new Game(
				{
					isValid: (word) => {
						checks.push(word);
						return check.promise;
					},
					pickAnswer: async () => 'worm'
				},
				noStore,
				() => clock.day
			);
			await slow.start();
			return { slow, check, checks, clock };
		};

		it('only checks once if Enter is pressed again', async () => {
			const { slow, check, checks } = await slowCheck();
			type(slow, 'cat');
			const first = slow.pressKey('Enter');
			const second = slow.pressKey('Enter');
			check.resolve(true);
			await Promise.all([first, second]);
			expect(checks).toEqual(['cat']);
			expect(slow.guesses).toEqual(['cat']);
		});

		it('drops the result if the guess was edited meanwhile', async () => {
			const { slow, check } = await slowCheck();
			type(slow, 'cat');
			const submitting = slow.pressKey('Enter');
			slow.pressKey('Backspace');
			check.resolve(true);
			await submitting;
			expect(slow.guesses).toEqual([]);
			expect(slow.activeGuess).toBe('ca');
		});

		it('drops the result if the day changed meanwhile', async () => {
			const { slow, check, clock } = await slowCheck();
			type(slow, 'cat');
			const submitting = slow.pressKey('Enter');
			clock.day = '2026-10-04';
			const resetting = slow.refreshDay();
			check.resolve(true);
			await Promise.all([submitting, resetting]);
			expect(slow.guesses).toEqual([]);
		});

		it('says so, and keeps the guess, if the check fails', async () => {
			const { slow, check } = await slowCheck();
			type(slow, 'cat');
			const submitting = slow.pressKey('Enter');
			check.reject(new Error('offline'));
			await submitting;
			expect(slow.notice).toMatch(/couldn't check that word/i);
			expect(slow.activeGuess).toBe('cat');
			expect(slow.guesses).toEqual([]);
		});
	});
});

describe('notice', () => {
	it('says when a guess is not a word, and keeps the guess', async () => {
		await guess(game, 'zzzzzz');
		expect(game.notice).toBe('Not in the word list');
		expect(game.activeGuess).toBe('zzzzzz');
	});

	it('clears on the next key press', async () => {
		await guess(game, 'zzzzzz');
		game.pressKey('Backspace');
		expect(game.notice).toBe('');
	});

	it('stays empty for a valid guess or an empty submit', async () => {
		await game.pressKey('Enter');
		expect(game.notice).toBe('');
		await guess(game, 'cat');
		expect(game.notice).toBe('');
	});

	it('clears when a new day starts', async () => {
		let day = '2026-10-03';
		game = new Game(fakeSource(['worm', 'dog']), noStore, () => day);
		await game.start();
		await guess(game, 'zzzzzz');
		day = '2026-10-04';
		await game.refreshDay();
		expect(game.notice).toBe('');
	});
});

describe('winning', () => {
	it('is playing until the answer is guessed, then wins', async () => {
		expect(game.status).toBe('playing');
		await guess(game, 'cat');
		expect(game.status).toBe('playing');
		await guess(game, 'worm');
		expect(game.status).toBe('win');
	});

	it('ignores typing, backspace and submit after a win', async () => {
		await guess(game, 'worm');
		type(game, 'cat');
		expect(game.activeGuess).toBe('');
		await game.pressKey('Enter');
		game.pressKey('Backspace');
		expect(game.guesses).toEqual(['worm']);
	});

	it('does not end the game on a guess of a different length', async () => {
		await guess(game, 'worms');
		expect(game.status).toBe('playing');
	});
});

describe('losing', () => {
	const wrong = ['cat', 'dog', 'the', 'and', 'not', 'but', 'you'];
	const guessAll = async (list: string[]) => {
		for (const word of list) await guess(game, word);
	};

	it('keeps playing until the guesses run out, then loses', async () => {
		await guessAll(wrong.slice(0, -1));
		expect(game.status).toBe('playing');
		await guess(game, wrong[wrong.length - 1]);
		expect(game.status).toBe('lose');
	});

	it('wins, not loses, when the last guess is the answer', async () => {
		await guessAll(wrong.slice(0, -1));
		await guess(game, 'worm');
		expect(game.status).toBe('win');
	});

	it('ignores typing and submitting after a loss', async () => {
		await guessAll(wrong);
		type(game, 'worm');
		await game.pressKey('Enter');
		expect(game.activeGuess).toBe('');
		expect(game.guesses).toEqual(wrong);
	});

	it('cannot be replayed when it is the word of the day', async () => {
		await guessAll(wrong);
		expect(game.canPlayAgain).toBe(false);
		await game.playAgain();
		expect(game.status).toBe('lose');
		expect(game.guesses).toEqual(wrong);
	});
});

describe('saving', () => {
	it('saves the answer once it has loaded', async () => {
		const store = memoryStore();
		await new Game(fakeSource(['worm']), store, today).start();
		expect(store.saved).toEqual({ mode: 'daily', day: DAY, answer: 'worm', guesses: [] });
	});

	it('saves each accepted guess, but not rejected ones', async () => {
		const store = memoryStore();
		const saving = new Game(fakeSource(['worm']), store, today);
		await saving.start();
		await guess(saving, 'cat');
		await guess(saving, 'zzzzzz');
		expect(store.saved).toEqual({
			mode: 'daily',
			day: DAY,
			answer: 'worm',
			guesses: ['cat']
		});
	});

	it('carries on a saved game instead of picking an answer', async () => {
		const store = memoryStore({ mode: 'daily', day: DAY, answer: 'dog', guesses: ['cat'] });
		const source = fakeSource(['worm']);
		const picked = vi.spyOn(source, 'pickAnswer');
		const resumed = new Game(source, store, today);
		await resumed.start();
		expect(picked).not.toHaveBeenCalled();
		expect(resumed.ready).toBe(true);
		expect(resumed.answer).toBe('dog');
		expect(resumed.guesses).toEqual(['cat']);
		await guess(resumed, 'dog');
		expect(resumed.status).toBe('win');
	});

	it('shows a finished game as finished', async () => {
		const over = ['cat', 'dog', 'the', 'and', 'not', 'but', 'you'];
		const resumed = new Game(
			fakeSource([]),
			memoryStore({ mode: 'daily', day: DAY, answer: 'worm', guesses: over }),
			today
		);
		await resumed.start();
		expect(resumed.status).toBe('lose');
	});

	it("ignores yesterday's game and picks the new word of the day", async () => {
		const store = memoryStore({
			mode: 'daily',
			day: '2026-10-02',
			answer: 'dog',
			guesses: ['cat']
		});
		const next = new Game(fakeSource(['worm']), store, today);
		await next.start();
		expect(next.answer).toBe('worm');
		expect(next.guesses).toEqual([]);
		expect(store.saved).toEqual({ mode: 'daily', day: DAY, answer: 'worm', guesses: [] });
	});

	it('forgets a won game on play again and saves the practice game', async () => {
		const store = memoryStore();
		const saving = new Game(fakeSource(['worm', 'dog']), store, today);
		await saving.start();
		await guess(saving, 'worm');
		await saving.playAgain();
		expect(store.saved).toEqual({ mode: 'practice', day: DAY, answer: 'dog', guesses: [] });
	});

	it('does not save when the answer fails to load', async () => {
		const store = memoryStore();
		await new Game(
			{
				isValid: async () => true,
				pickAnswer: async () => {
					throw new Error('offline');
				}
			},
			store,
			today
		).start();
		expect(store.saved).toBeNull();
	});
});

describe('the word of the day', () => {
	/** A source that records what it was asked to pick with. */
	const recordingSource = () => {
		const randoms: Array<(() => number) | undefined> = [];
		const source: WordSource = {
			isValid: async (word) => words.has(word),
			pickAnswer: async (random) => {
				randoms.push(random);
				return 'worm';
			}
		};
		return { source, randoms };
	};

	it('is picked with the same random sequence for everyone on a day', async () => {
		const first = recordingSource();
		const second = recordingSource();
		await new Game(first.source, noStore, today).start();
		await new Game(second.source, noStore, today).start();
		expect(first.randoms[0]!()).toBe(second.randoms[0]!());
	});

	it('is a different sequence on another day', async () => {
		const first = recordingSource();
		const second = recordingSource();
		await new Game(first.source, noStore, today).start();
		await new Game(second.source, noStore, () => '2026-10-04').start();
		expect(first.randoms[0]!()).not.toBe(second.randoms[0]!());
	});

	it('starts in daily mode on the current day', async () => {
		game = new Game(fakeSource(['worm']), noStore, today);
		await game.start();
		expect(game.mode).toBe('daily');
		expect(game.day).toBe(DAY);
	});

	it('moves on to the next word when the day changes', async () => {
		let day = DAY;
		game = new Game(fakeSource(['worm', 'dog']), noStore, () => day);
		await game.start();
		await guess(game, 'cat');
		await game.refreshDay();
		expect(game.answer).toBe('worm');
		day = '2026-10-04';
		await game.refreshDay();
		expect(game.answer).toBe('dog');
		expect(game.guesses).toEqual([]);
		expect(game.day).toBe('2026-10-04');
	});

	it('leaves a practice game in progress alone when the day changes', async () => {
		let day = DAY;
		game = new Game(fakeSource(['worm', 'dog', 'cat']), noStore, () => day);
		await game.start();
		await guess(game, 'worm');
		await game.playAgain();
		await guess(game, 'cat');
		day = '2026-10-04';
		await game.refreshDay();
		expect(game.mode).toBe('practice');
		expect(game.answer).toBe('dog');
		expect(game.guesses).toEqual(['cat']);
	});
});

describe('play again', () => {
	it('starts a random practice game once the daily word is won', async () => {
		game = new Game(fakeSource(['worm', 'dog']), noStore, today);
		await game.start();
		await guess(game, 'worm');
		expect(game.canPlayAgain).toBe(true);
		await game.playAgain();
		expect(game.mode).toBe('practice');
		expect(game.status).toBe('playing');
		expect(game.guesses).toEqual([]);
		expect(game.activeGuess).toBe('');
		expect(game.answer).toBe('dog');
	});

	it('picks a practice word at random, not from the date', async () => {
		const randoms: Array<(() => number) | undefined> = [];
		game = new Game(
			{
				isValid: async (word) => words.has(word),
				pickAnswer: async (random) => (randoms.push(random), 'worm')
			},
			noStore,
			today
		);
		await game.start();
		await guess(game, 'worm');
		await game.playAgain();
		expect(randoms[1]).toBeUndefined();
	});

	it('does nothing while the game is still being played', async () => {
		await guess(game, 'cat');
		await game.playAgain();
		expect(game.guesses).toEqual(['cat']);
	});

	it('can be repeated after losing a practice game', async () => {
		const wrong = ['cat', 'dog', 'the', 'and', 'not', 'but', 'you'];
		game = new Game(fakeSource(['worm', 'worm', 'dog']), noStore, today);
		await game.start();
		await guess(game, 'worm');
		await game.playAgain();
		for (const word of wrong) await guess(game, word);
		expect(game.status).toBe('lose');
		expect(game.canPlayAgain).toBe(true);
		await game.playAgain();
		expect(game.status).toBe('playing');
		expect(game.answer).toBe('dog');
	});

	it('is not playable until the new answer has loaded', async () => {
		const next = deferred<string>();
		const answers = [Promise.resolve('worm'), next.promise];
		game = new Game({ isValid: async () => true, pickAnswer: () => answers.shift()! });
		await game.start();
		await guess(game, 'worm');
		const replaying = game.playAgain();
		expect(game.ready).toBe(false);
		type(game, 'cat');
		expect(game.activeGuess).toBe('');
		next.resolve('dog');
		await replaying;
		expect(game.ready).toBe(true);
	});
});

describe('keyboardStatus', () => {
	const flat = () => Object.fromEntries(game.keyboardStatus.flat().map((k) => [k.char, k.status]));

	it('starts with every key new', () => {
		expect(Object.values(flat()).every((s) => s === 'new')).toBe(true);
	});

	it('includes the enter and delete keys', () => {
		expect(Object.keys(flat())).toEqual(expect.arrayContaining(['⏎', '⌫']));
	});

	it('colours keys from the guesses', async () => {
		await guess(game, 'mop'); // m close, o close, p wrong
		expect(flat()).toMatchObject({ m: 'close', o: 'right', p: 'wrong', q: 'new' });
	});

	it('upgrades a key when a later guess scores the letter higher', async () => {
		await guess(game, 'arm'); // r is close
		expect(flat().r).toBe('close');
		await guess(game, 'word'); // r is right
		expect(flat().r).toBe('right');
	});

	it('does not downgrade a key when a later guess scores it lower', async () => {
		await guess(game, 'word'); // w, o, r right
		await guess(game, 'arm'); // r close, m close, a wrong
		expect(flat()).toMatchObject({ w: 'right', o: 'right', r: 'right', m: 'close', a: 'wrong' });
	});
});
