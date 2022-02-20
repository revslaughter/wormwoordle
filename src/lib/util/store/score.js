/**
 * Scores the guess
 * @param {Array<{status:string}>} analyzedGuess
 * @returns number
 */
export const scoreGuess = (analyzedGuess) => {
	return analyzedGuess
		.map(({ status }) => {
			switch (status) {
				case 'right':
					return 3;
				case 'close':
					return 1;
				default:
					return 0;
			}
		})
		.reduce((a, b) => a + b, 0);
};
