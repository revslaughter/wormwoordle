import { describe, it, expect } from 'vitest';
import { buildShareText } from './share';

describe('buildShareText', () => {
	it('summarises each guess with letter squares and a length marker', () => {
		const text = buildShareText(['the', 'acetate', 'acetates'], 'acetates');
		expect(text.split('\n')).toEqual([
			'WormWord 👹 3 guesses',
			'',
			'🟨⬛🟩➡️',
			'🟩🟩🟩🟩🟩🟩🟩➡️',
			'🟩🟩🟩🟩🟩🟩🟩🟩😃'
		]);
	});

	it('uses a green dot when the length is right but the word is not', () => {
		expect(buildShareText(['latch'], 'catch')).toContain('⬛🟩🟩🟩🟩🟢');
	});

	it('uses a left arrow when the guess is too long', () => {
		expect(buildShareText(['worms'], 'worm').split('\n')[2]).toBe('🟩🟩🟩🟩⬛⬅️');
	});

	it('includes the date for the word of the day', () => {
		expect(buildShareText(['worm'], 'worm', '2026-10-03').split('\n')[0]).toBe(
			'WormWord 👹 2026-10-03 1 guess'
		);
		expect(buildShareText(['cat'], 'worm', '2026-10-03').split('\n')[0]).toBe(
			'WormWord 👹 2026-10-03 stumped after 1 guesses 💀'
		);
	});

	it('says "guess" for a single guess', () => {
		expect(buildShareText(['worm'], 'worm').split('\n')[0]).toBe('WormWord 👹 1 guess');
	});

	it('says the worm won when the answer was never found', () => {
		const text = buildShareText(['cat', 'dog'], 'worm');
		expect(text.split('\n')[0]).toBe('WormWord 👹 stumped after 2 guesses 💀');
		expect(text).not.toContain('😃');
	});

	it('does not reveal the answer', () => {
		expect(buildShareText(['the', 'acetates'], 'acetates')).not.toContain('acetates');
	});
});
