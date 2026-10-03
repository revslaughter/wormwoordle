import { describe, it, expect } from 'vitest';
import { analyzeGuess, lengthHint } from './analyze';

const statuses = (guess: string, answer: string) =>
	analyzeGuess(guess, answer).map((l) => l.status);
const R = 'right';
const C = 'close';
const W = 'wrong';

describe('analyzeGuess', () => {
	it('keeps the letters of the guess', () => {
		expect(analyzeGuess('cat', 'cut').map((l) => l.char)).toEqual(['c', 'a', 't']);
	});

	it('marks an exact match as all right', () => {
		expect(statuses('worm', 'worm')).toEqual([R, R, R, R]);
	});

	it('marks letters not in the answer as wrong', () => {
		expect(statuses('abc', 'xyz')).toEqual([W, W, W]);
	});

	it('marks letters in the wrong place as close', () => {
		expect(statuses('worm', 'mrow')).toEqual([C, C, C, C]);
	});

	it('mixes right, close and wrong', () => {
		// the vs acetates: t is elsewhere, h is absent, e is in place
		expect(statuses('the', 'acetates')).toEqual([C, W, R]);
	});

	it('only vouches for as many copies as the answer has', () => {
		// answer has one l; the first l is close, the second has nothing left to claim
		expect(statuses('llama', 'hotel')).toEqual([C, W, W, W, W]);
	});

	it('lets exact matches claim a letter before close matches do', () => {
		// answer has one e, in position 1; the earlier e must not steal it
		expect(statuses('eel', 'bed')).toEqual([W, R, W]);
	});

	it('marks a later copy close when the answer has an unclaimed one', () => {
		// regression: panorama vs papal. p and a match exactly; the answer still
		// has a spare a at position 3, so the a at position 5 is close
		expect(statuses('panorama', 'papal')).toEqual([R, R, W, W, W, C, W, W]);
	});

	it('handles guesses longer than the answer', () => {
		expect(statuses('worms', 'worm')).toEqual([R, R, R, R, W]);
	});

	it('handles guesses shorter than the answer', () => {
		expect(statuses('wor', 'worm')).toEqual([R, R, R]);
	});

	it('returns nothing for an empty guess', () => {
		expect(analyzeGuess('', 'worm')).toEqual([]);
	});
});

describe('lengthHint', () => {
	it('says short, long or same', () => {
		expect(lengthHint('cat', 'catch')).toBe('short');
		expect(lengthHint('catcher', 'catch')).toBe('long');
		expect(lengthHint('latch', 'catch')).toBe('same');
	});
});
