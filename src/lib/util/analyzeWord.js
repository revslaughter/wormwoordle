/**
 * Return an array of all the indices of a character given a word.
 *
 * example:
 *
 * ```js
 * getIndiciesForCharacter('t', 'test') -> [0,3]
 * ```
 *
 * @param {string} char A string of length one
 * @param {string} str
 * @returns {number[]}
 */
function getIndiciesForCharacter(char, str) {
	let matches = str.matchAll(new RegExp(char, 'g'));

	//make into array and get the indicies
	let indicesBack = [...matches].map((m) => m.index);

	return indicesBack;
}

/**
 * Find the common elements of an array and return it
 *
 * example:
 *
 * ```js
 * intersect([0,2,4,6,8], [4,8,12]) -> [4,8]
 * ```
 *
 * @param {Array<number>} oneArray
 * @param {Array<number>} twoArray
 * @returns {Array<number>} The common elements of the arrays
 */
const intersect = (oneArray, twoArray) => oneArray.filter((x) => twoArray.includes(x));

/**
 * Given a word and a comparison word, make a function that will compare
 * the letters of the word and its comparison and the location of that letter
 * in the comparison word, suitable for use in a `map` function.
 *
 * @param {wtring} word
 * @param {string} comparison
 * @returns
 */
const getIndiciesForWord =
	(word, comparison) =>
	/**
	 * creates an object with useful properties for analysis
	 * @param {string} letter
	 * @param {number} index
	 * @returns {{char: string, index: number, allIx: number[], compIx: number[]}}
	 */
	(letter, index) => ({
		char: letter,
		index: index,
		allIx: getIndiciesForCharacter(letter, word),
		compIx: getIndiciesForCharacter(letter, comparison)
	});

/**
 * Given an analysis item, compare its indicies and intersections to
 * get a status for that particular letter in that particular position.
 *
 * If the letter is not in the answer, its status is 'wrong'.
 *
 * If the letter is in a matching position in the answer, the status is `right`.
 *
 * The letter is `close` if it appears elsewhere in the word. This is
 * a little complicated to determine, if there are multiple instances
 * of that letter.
 *
 * _e.g._
 * ```js
 * // We are 'on' the fourth letter of the guess
 * index == 3;
 *
 * // This letter occurs at indicies 2, 3, 4, and 5
 * // of the guess word
 * allIx == [2,3,4,5];
 *
 * // The third letter of the guess (index 2) is the last
 * // occurence of the letter in the answer.
 * // This letter is also the second letter of the answer, so
 * // there should be one 'right' letter and one 'close' letter
 * compIx == [1,2];
 *
 * // The second letter is what's in common
 * // between allIx and compIx.
 * intersection == [2];
 * // We are 'on' the third letter,
 * // but 3 isn't included in the intersection.
 * // 4 and 5 are neither in compIx nor the intersection.
 *
 * ```
 * in this example, `2` should be `right`, but `3` should be `close`, and `4`
 * and `5` should be `wrong`.
 *
 * @param {{
 * 	char: string,
 * 	index: number,
 * 	allIx: number[],
 * 	compIx: number[],
 * 	intersection: number[]}} item
 * @returns
 */
const determineStatus = (item) => {
	let status = 'wrong';
	if (item.intersection.includes(item.index)) {
		status = 'right';
	} else if (item.compIx.length >= item.allIx.length) {
		status = 'close';
	} else if (item.compIx.length < item.allIx.length) {
		// Compare this letter to the difference of occurrence lengths in the
		// answer and the intersection (right answers take up the intersection length).
		// If we're outside of those then we are out of bounds.
		let thisIsNumber = item.allIx.indexOf(item.index) + 1;
		if (thisIsNumber > item.compIx.length - item.intersection.length) {
			status = 'wrong';
		} else {
			// otherwise we are 'close'
			status = 'close';
		}
	}
	return { ...item, status };
};

const getIntersectionForWord = (item) => ({
	...item,
	intersection: intersect(item.allIx, item.compIx)
});

/**
 * This provides an object that has the characters and status of each character.
 * It's kind of a nightmare, and should probably be refactored.
 * @param {string} word
 * @param {string} comparison
 */
export const analyze = (word, comparison) =>
	[...word]
		.map(getIndiciesForWord(word, comparison))
		.map(getIntersectionForWord)
		.map(determineStatus);
