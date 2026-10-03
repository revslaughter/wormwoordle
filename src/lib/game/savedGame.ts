import { MIN_LETTERS, MAX_LETTERS, MAX_GUESSES } from './settings';

/** What is kept between visits: enough to carry on (or look back at) the current game. */
export interface SavedGame {
	answer: string;
	guesses: string[];
}

export interface GameStore {
	/** The saved game, or null if there is none or it can't be trusted. */
	load(): SavedGame | null;
	save(game: SavedGame): void;
	clear(): void;
}

/** A store that remembers nothing, for games that shouldn't persist. */
export const noStore: GameStore = { load: () => null, save() {}, clear() {} };

const KEY = 'wormwordle:game';

const isWord = (value: unknown): value is string =>
	typeof value === 'string' &&
	value.length >= MIN_LETTERS &&
	value.length <= MAX_LETTERS &&
	/^[a-z]+$/.test(value);

/** Checks data read from storage, which may be stale, hand-edited or from another version. */
const parse = (raw: string | null): SavedGame | null => {
	if (raw === null) return null;
	try {
		const { answer, guesses } = JSON.parse(raw) ?? {};
		const valid =
			isWord(answer) &&
			Array.isArray(guesses) &&
			guesses.length <= MAX_GUESSES &&
			guesses.every(isWord);
		return valid ? { answer, guesses } : null;
	} catch {
		return null;
	}
};

/**
 * Stores the game in a Web Storage object (e.g. localStorage). The storage is fetched on use,
 * so this is safe to create during server rendering, and a missing or blocked storage just
 * means nothing is remembered.
 */
export const createGameStore = (getStorage: () => Storage): GameStore => {
	const attempt = <T>(fallback: T, action: (storage: Storage) => T): T => {
		try {
			return action(getStorage());
		} catch {
			return fallback;
		}
	};
	return {
		load: () => attempt(null, (s) => parse(s.getItem(KEY))),
		save: (game) => attempt(undefined, (s) => s.setItem(KEY, JSON.stringify(game))),
		clear: () => attempt(undefined, (s) => s.removeItem(KEY))
	};
};
