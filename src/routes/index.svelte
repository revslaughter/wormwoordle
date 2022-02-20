<script>
	import GuessRow from '$lib/components/GuessRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import lookupWord from '$lib/util/lookupWord';
	import { guesses, analyzedGuesses } from '$lib/util/store/gameStatus';
	let activeGuess = '';
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Enter' && activeGuess !== '' && lookupWord(activeGuess)) {
			$guesses = [...$guesses, activeGuess];
			activeGuess = '';
		}
	}}
/>

<div id="Game">
	{#each $analyzedGuesses as guess, tryCount}
		<WordRow {guess} {tryCount} />
	{/each}
	<GuessRow bind:activeGuess />
</div>
