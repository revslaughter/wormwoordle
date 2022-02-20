import * as listJson from '$lib/2of12inf';
import SETTINGS from './settings';

/**
 * Returns the entire list (currently from 2of12inf)
 * @param {*} list
 * @returns string[]
 */
const unwrapJson = (list) => list.default;

/**
 * Gets list of words between the min and max number of letters
 * @param {string[]} list
 * @returns string[]
 */
const filterWords = (list) =>
	list
		.filter((w) => w.length <= SETTINGS.MAX_LETTERS)
		.filter((w) => w.length >= SETTINGS.MIN_LETTERS);

export default filterWords(unwrapJson(listJson));
