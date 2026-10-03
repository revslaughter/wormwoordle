import { describe, it, expect, vi, beforeEach } from 'vitest';

let answers: string[];
vi.mock('./words', async () => {
	const actual = await vi.importActual<typeof import('./words')>('./words');
	return { ...actual, pickAnswer: () => answers.shift() ?? 'worm' };
});

import { Game } from './game.svelte';

const type = (game: Game, text: string) => [...text].forEach((c) => game.pressKey(c));
const guess = (game: Game, word: string) => {
	type(game, word);
	game.pressKey('Enter');
};

let game: Game;
beforeEach(() => {
	answers = ['worm'];
	game = new Game();
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
	it('accepts a real word from either keyboard', () => {
		guess(game, 'cat');
		type(game, 'dog');
		game.pressKey('⏎');
		expect(game.guesses).toEqual(['cat', 'dog']);
		expect(game.activeGuess).toBe('');
	});

	it('rejects a non-word and keeps what was typed', () => {
		guess(game, 'zzzzzz');
		expect(game.guesses).toEqual([]);
		expect(game.activeGuess).toBe('zzzzzz');
	});

	it('does nothing on an empty guess', () => {
		game.pressKey('Enter');
		expect(game.guesses).toEqual([]);
	});

	it('analyzes each guess against the answer', () => {
		guess(game, 'wore');
		expect(game.analyzedGuesses[0].map((l) => l.status)).toEqual([
			'right',
			'right',
			'right',
			'wrong'
		]);
	});
});

describe('winning', () => {
	it('is playing until the answer is guessed, then wins', () => {
		expect(game.status).toBe('playing');
		guess(game, 'cat');
		expect(game.status).toBe('playing');
		guess(game, 'worm');
		expect(game.status).toBe('win');
	});

	it('ignores typing, backspace and submit after a win', () => {
		guess(game, 'worm');
		type(game, 'cat');
		expect(game.activeGuess).toBe('');
		game.pressKey('Enter');
		game.pressKey('Backspace');
		expect(game.guesses).toEqual(['worm']);
	});

	it('does not end the game on a guess of a different length', () => {
		guess(game, 'worms');
		expect(game.status).toBe('playing');
	});
});

describe('reset', () => {
	it('starts a fresh game with a new answer', () => {
		answers.push('dog');
		guess(game, 'worm');
		type(game, 'ca');
		game.reset();
		expect(game.status).toBe('playing');
		expect(game.guesses).toEqual([]);
		expect(game.activeGuess).toBe('');
		expect(game.answer).toBe('dog');
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

	it('colours keys from the guesses', () => {
		guess(game, 'mop'); // m close, o close, p wrong
		expect(flat()).toMatchObject({ m: 'close', o: 'right', p: 'wrong', q: 'new' });
	});

	it('upgrades a key when a later guess scores the letter higher', () => {
		guess(game, 'arm'); // r is close
		expect(flat().r).toBe('close');
		guess(game, 'word'); // r is right
		expect(flat().r).toBe('right');
	});

	it('does not downgrade a key when a later guess scores it lower', () => {
		guess(game, 'word'); // w, o, r right
		guess(game, 'arm'); // r close, m close, a wrong
		expect(flat()).toMatchObject({ w: 'right', o: 'right', r: 'right', m: 'close', a: 'wrong' });
	});
});
