import wordList from './store/wordList';

export default function lookupWord(wordToCheck) {
	return wordList.includes(wordToCheck);
}
