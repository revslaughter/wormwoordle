import wordListJson from './2of12inf.json';
import { MIN_LETTERS, MAX_LETTERS } from './settings';

/** Every word we accept as a guess or choose as an answer (from 2of12inf). */
export const wordList: string[] = wordListJson.filter(
	(w) => w.length >= MIN_LETTERS && w.length <= MAX_LETTERS
);

const wordSet = new Set(wordList);

export const isValidWord = (word: string): boolean => wordSet.has(word);

/** A random word from the list. */
export const pickAnswer = (): string => wordList[Math.floor(Math.random() * wordList.length)];
