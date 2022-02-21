<script>
	import { flip } from 'svelte/animate';
	import GuessRow from '$lib/components/GuessRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import lookupWord from '$lib/util/lookupWord';
	import { guesses, analyzedGuesses, activeGuess } from '$lib/util/store/gameStatus';
	import Keyboard from '$lib/components/Keyboard.svelte';
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Enter' && $activeGuess !== '' && lookupWord($activeGuess)) {
			$guesses = [...$guesses, $activeGuess];
			$activeGuess = '';
		}
	}}
/>

<div id="Game">
	{#each $analyzedGuesses as guess, tryCount (tryCount)}
		<div animate:flip>
			<WordRow {guess} {tryCount} />
		</div>
	{/each}
	<GuessRow />
</div>

<div id="Keyboard">
	<Keyboard />
</div>
