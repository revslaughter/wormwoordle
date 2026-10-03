/** Today's date in the player's own time zone, e.g. `2026-10-03`. */
export const dateKey = (date: Date = new Date()): string =>
	[date.getFullYear(), date.getMonth() + 1, date.getDate()]
		.map((part) => String(part).padStart(2, '0'))
		.join('-');

/** A 32-bit FNV-1a hash of a string. */
export const hashString = (text: string): number => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
};

/** A random number generator (mulberry32) that gives the same sequence for the same seed. */
export const seededRandom = (seed: number): (() => number) => {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** The random number generator that picks the word for a given day, the same for everyone. */
export const dailyRandom = (day: string): (() => number) => seededRandom(hashString(day));
