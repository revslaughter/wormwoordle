/**
 * Chooses a word for the current game and sets it as the svelte store's answer
 */

import { readable } from 'svelte/store';
import wordList from './wordList';

export const findWord = () => {
	const magnitude = 10 ** (Math.round(Math.log10(wordList.length)) + 1);
	const answerIndex = Math.round((Math.random() * magnitude) % wordList.length);
	return wordList[answerIndex];
};

const initWord = findWord();
export const storeAnswer = readable(initWord);
