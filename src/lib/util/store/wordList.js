import * as listJson from '$lib/2of12inf';
import SETTINGS from './settings';

const unwrapJson = (list) => list.default;

const filterWords = (list) => list.filter((w) => w.length <= SETTINGS.MAX_LETTERS);

export default filterWords(unwrapJson(listJson));
