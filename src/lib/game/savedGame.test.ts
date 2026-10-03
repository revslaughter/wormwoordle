import { describe, it, expect } from 'vitest';
import { createGameStore } from './savedGame';

/** Just enough of Web Storage for the store. */
const memoryStorage = (initial: Record<string, string> = {}) => {
	const data = new Map(Object.entries(initial));
	return {
		data,
		storage: {
			getItem: (key: string) => data.get(key) ?? null,
			setItem: (key: string, value: string) => void data.set(key, value),
			removeItem: (key: string) => void data.delete(key)
		} as Storage
	};
};

const KEY = 'wormwordle:game';

describe('createGameStore', () => {
	it('loads nothing when nothing has been saved', () => {
		expect(createGameStore(() => memoryStorage().storage).load()).toBeNull();
	});

	it('loads what was saved', () => {
		const { storage } = memoryStorage();
		createGameStore(() => storage).save({ answer: 'worm', guesses: ['cat', 'dog'] });
		expect(createGameStore(() => storage).load()).toEqual({
			answer: 'worm',
			guesses: ['cat', 'dog']
		});
	});

	it('forgets a game when cleared', () => {
		const { storage } = memoryStorage();
		const store = createGameStore(() => storage);
		store.save({ answer: 'worm', guesses: [] });
		store.clear();
		expect(store.load()).toBeNull();
	});

	describe('does not trust what it reads', () => {
		const loadRaw = (raw: string) =>
			createGameStore(() => memoryStorage({ [KEY]: raw }).storage).load();

		it.each([
			['not JSON', '{oops'],
			['null', 'null'],
			['no answer', JSON.stringify({ guesses: [] })],
			['an answer that is too short', JSON.stringify({ answer: 'ab', guesses: [] })],
			['an answer that is not lowercase letters', JSON.stringify({ answer: 'Worm', guesses: [] })],
			['guesses that are not a list', JSON.stringify({ answer: 'worm', guesses: 'cat' })],
			['a guess that is not a word', JSON.stringify({ answer: 'worm', guesses: ['cat', 7] })],
			[
				'more guesses than allowed',
				JSON.stringify({ answer: 'worm', guesses: Array(8).fill('cat') })
			]
		])('ignores %s', (_, raw) => {
			expect(loadRaw(raw)).toBeNull();
		});
	});

	it('copes with storage that throws, e.g. when blocked', () => {
		const store = createGameStore(() => {
			throw new Error('blocked');
		});
		expect(store.load()).toBeNull();
		expect(() => store.save({ answer: 'worm', guesses: [] })).not.toThrow();
		expect(() => store.clear()).not.toThrow();
	});
});
