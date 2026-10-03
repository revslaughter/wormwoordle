import { describe, it, expect } from 'vitest';
import { wordList, isValidWord, pickAnswer } from './words';
import { MIN_LETTERS, MAX_LETTERS } from './settings';

describe('word list', () => {
	it('only contains words within the length limits', () => {
		expect(wordList.length).toBeGreaterThan(0);
		expect(wordList.every((w) => w.length >= MIN_LETTERS && w.length <= MAX_LETTERS)).toBe(true);
	});

	it('excludes words that are too short or too long', () => {
		expect(wordList.some((w) => w.length < MIN_LETTERS)).toBe(false);
		expect(wordList.some((w) => w.length > MAX_LETTERS)).toBe(false);
	});
});

describe('isValidWord', () => {
	it('accepts real words', () => {
		expect(isValidWord('worm')).toBe(true);
		expect(isValidWord('aardvark')).toBe(true);
	});

	it('rejects non-words and empty strings', () => {
		expect(isValidWord('zzzzzz')).toBe(false);
		expect(isValidWord('')).toBe(false);
	});

	it('rejects words outside the length limits', () => {
		expect(isValidWord('a')).toBe(false);
		expect(isValidWord('abandonment')).toBe(false); // 11 letters
	});
});

describe('pickAnswer', () => {
	it('always picks a word from the list, including at the extremes', () => {
		for (let i = 0; i < 1000; i++) expect(isValidWord(pickAnswer())).toBe(true);
	});
});
