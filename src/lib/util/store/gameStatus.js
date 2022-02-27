import { writable, derived, get } from 'svelte/store';
import { analyze } from '../analyzeWord';
import { storeAnswer } from './chooseWord';
import SETTINGS from './settings';

export let activeGuess = writable('');
export let guesses = writable([]);
export let analyzedGuesses = derived(guesses, ($guesses) => {
	let answer = get(storeAnswer);
	let eachGuess = $guesses;
	return eachGuess.map((w) => analyze(w, answer));
});

export let keyboardStatus = derived(analyzedGuesses, ($analyzedGuesses) => {
	const keebLetters = SETTINGS.KEYBOARD_ROWS.map((row) =>
		[...row].map((l) => ({ char: l, status: 'new' }))
	);
	let uniqueLetters = $analyzedGuesses
		.flat() // get just all the letters, we don't care about the words
		.map(({ char, status }) => ({ char, status })); // just the properties we care about

	let letterHash = {};
	let statusSetter = ({ char, status }) => (letterHash[char].status = status);
	keebLetters.forEach((row) =>
		row.forEach(({ char, status }) => (letterHash[char] = { char, status }))
	);
	// first do all the wrong ones
	uniqueLetters.filter((ls) => ls.status === 'wrong').forEach(statusSetter);
	// then do all the close ones
	uniqueLetters.filter((ls) => ls.status === 'close').forEach(statusSetter);
	// then do all the right ones
	uniqueLetters.filter((ls) => ls.status === 'right').forEach(statusSetter);

	let keebStatus = keebLetters.map((row) =>
		row.map(({ char }) => ({ char, status: letterHash[char].status }))
	);
	return keebStatus;
});
export let score = writable(0);
