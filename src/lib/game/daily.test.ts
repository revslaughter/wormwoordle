import { describe, it, expect } from 'vitest';
import { dailyRandom, dateKey, hashString, seededRandom } from './daily';

describe('dateKey', () => {
	it('is the local date, padded', () => {
		expect(dateKey(new Date(2026, 9, 3, 23, 59))).toBe('2026-10-03');
		expect(dateKey(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
	});
});

describe('hashString', () => {
	it('is stable, and differs between dates', () => {
		expect(hashString('2026-10-03')).toBe(hashString('2026-10-03'));
		expect(hashString('2026-10-03')).not.toBe(hashString('2026-10-04'));
	});

	it('is an unsigned 32-bit integer', () => {
		const hash = hashString('2026-10-03');
		expect(Number.isInteger(hash)).toBe(true);
		expect(hash).toBeGreaterThanOrEqual(0);
		expect(hash).toBeLessThan(2 ** 32);
	});
});

describe('seededRandom', () => {
	const take = (random: () => number, n: number) => Array.from({ length: n }, random);

	it('gives the same sequence for the same seed, and a different one otherwise', () => {
		expect(take(seededRandom(1), 5)).toEqual(take(seededRandom(1), 5));
		expect(take(seededRandom(1), 5)).not.toEqual(take(seededRandom(2), 5));
	});

	it('stays in [0, 1) and is spread out', () => {
		const values = take(seededRandom(12345), 2000);
		expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		expect(mean).toBeGreaterThan(0.45);
		expect(mean).toBeLessThan(0.55);
	});
});

describe('dailyRandom', () => {
	it('is the same for everyone on a day', () => {
		expect(dailyRandom('2026-10-03')()).toBe(dailyRandom('2026-10-03')());
	});
});
