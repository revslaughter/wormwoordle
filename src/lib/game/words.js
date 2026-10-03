import wordListJson from './2of12inf.json';
import { MIN_LETTERS, MAX_LETTERS } from './settings';

/** Every word we accept as a guess or choose as an answer (from 2of12inf). */
export const wordList = wordListJson.filter(
	(w) => w.length >= MIN_LETTERS && w.length <= MAX_LETTERS
);

const wordSet = new Set(wordList);

/**
 * @param {string} word
 * @returns {boolean}
 */
export const isValidWord = (word) => wordSet.has(word);

/**
 * @returns {string} a random word from the list
 */
export const pickAnswer = () => wordList[Math.floor(Math.random() * wordList.length)];
