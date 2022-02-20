import { writable, derived, get } from 'svelte/store';
import { analyze } from '../analyzeWord';
import { storeAnswer } from './chooseWord';

export let guesses = writable([]);
export let analyzedGuesses = derived(guesses, ($guesses) => {
	let answer = get(storeAnswer);
	let eachGuess = $guesses;
	return eachGuess.map((w) => analyze(w, answer));
});
export let score = writable(0);
