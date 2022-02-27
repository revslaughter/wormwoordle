<script>
	import lookupWord from '$lib/util/lookupWord';

	import { guesses, activeGuess, keyboardStatus } from '$lib/util/store/gameStatus';
	import SETTINGS from '$lib/util/store/settings';
	import Key from './Key.svelte';

	let handleKey = (letter) => {
		switch (letter) {
			case '⏎':
				if ($activeGuess !== '' && lookupWord($activeGuess)) {
					$guesses = [...$guesses, $activeGuess];
					$activeGuess = '';
				}
				break;
			case '⌫':
				$activeGuess = $activeGuess.substring(0, $activeGuess.length - 1);
				break;
			default:
				$activeGuess = ($activeGuess + letter).substring(0, SETTINGS.MAX_LETTERS);
				break;
		}
	};
</script>

<div class="keyboard">
	{#each $keyboardStatus as row}
		<div class="keebRow">
			{#each row as keyWithStatus}
				<Key char={keyWithStatus.char} {handleKey} status={keyWithStatus.status} />
			{/each}
		</div>
	{/each}
</div>

<style>
	.keyboard {
		margin-top: 4rem;
	}
	.keebRow {
		display: flex;
		gap: 0.25em;
		margin-bottom: 2px;
		justify-content: center;
		height: 2.5em;
	}
</style>
