import { describe, it, expect, beforeEach } from 'vitest';
import wordList from '../../../data/2of12inf.json';
import { Game } from './game.svelte';
import type { WordSource } from './words';

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
			const slow = new Game({
				isValid: (word) => {
					checks.push(word);
					return check.promise;
				},
				pickAnswer: async () => 'worm'
			});
			await slow.start();
			return { slow, check, checks };
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

		it('drops the result if the game was reset meanwhile', async () => {
			const { slow, check } = await slowCheck();
			type(slow, 'cat');
			const submitting = slow.pressKey('Enter');
			const resetting = slow.reset();
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

	it('clears on reset', async () => {
		await guess(game, 'zzzzzz');
		await game.reset();
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

	it('starts a fresh game on reset', async () => {
		await guessAll(wrong);
		await game.reset();
		expect(game.status).toBe('playing');
		expect(game.guesses).toEqual([]);
	});
});

describe('reset', () => {
	it('starts a fresh game with a new answer', async () => {
		game = new Game(fakeSource(['worm', 'dog']));
		await game.start();
		await guess(game, 'worm');
		type(game, 'ca');
		await game.reset();
		expect(game.status).toBe('playing');
		expect(game.guesses).toEqual([]);
		expect(game.activeGuess).toBe('');
		expect(game.answer).toBe('dog');
	});

	it('is not playable until the new answer has loaded', async () => {
		const next = deferred<string>();
		const answers = [Promise.resolve('worm'), next.promise];
		game = new Game({ isValid: async () => true, pickAnswer: () => answers.shift()! });
		await game.start();
		const resetting = game.reset();
		expect(game.ready).toBe(false);
		type(game, 'cat');
		expect(game.activeGuess).toBe('');
		next.resolve('dog');
		await resetting;
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
