/**
 * Chooses a word for the current game and sets it as the svelte store's answer
 */

import { writable } from 'svelte/store';
import * as WORDS from '$lib/2of12inf';

export const findWord = () => {
	const goodWords = WORDS.default.filter((w) => w.length <= 10);
	const magnitude = 10 ** (Math.round(Math.log10(goodWords.length)) + 1);
	const answerIndex = Math.round((Math.random() * magnitude) % goodWords.length);
	console.log(goodWords[answerIndex]);
	return goodWords[answerIndex];
};

const initWord = findWord();
export const storeAnswer = writable(initWord);
