// Splits data/2of12inf.json into static shards that the game fetches on demand:
//   static/words/{length}-{firstLetter}.txt   one word per line
//   static/words/index.json                   { "{length}-{firstLetter}": wordCount }
// Run with `npm run words` after changing the word list or the length limits.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

// Keep in sync with src/lib/game/settings.ts (words.test.ts checks the shards match)
const MIN_LETTERS = 3;
const MAX_LETTERS = 10;

const source = JSON.parse(readFileSync(new URL('../data/2of12inf.json', import.meta.url), 'utf8'));
const outDir = new URL('../static/words/', import.meta.url);

/** @type {Map<string, string[]>} */
const shards = new Map();
for (const word of source) {
	if (word.length < MIN_LETTERS || word.length > MAX_LETTERS) continue;
	if (!/^[a-z]+$/.test(word)) throw new Error(`Unexpected word in list: "${word}"`);
	const key = `${word.length}-${word[0]}`;
	shards.set(key, [...(shards.get(key) ?? []), word]);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const index = {};
for (const [key, words] of [...shards].sort(([a], [b]) =>
	a.localeCompare(b, 'en', { numeric: true })
)) {
	writeFileSync(new URL(`${key}.txt`, outDir), words.join('\n') + '\n');
	index[key] = words.length;
}
writeFileSync(new URL('index.json', outDir), JSON.stringify(index) + '\n');

const total = Object.values(index).reduce((a, b) => a + b, 0);
console.log(`Wrote ${shards.size} shards (${total} words) to static/words/`);
