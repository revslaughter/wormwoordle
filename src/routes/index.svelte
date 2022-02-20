<script>
	import GuessRow from '$lib/components/GuessRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';

	let activeGuess = '';
	let guesses = [];
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Enter' && activeGuess !== '') {
			guesses = [...guesses, activeGuess];
			activeGuess = '';
		}
	}}
/>

<div id="Game">
	{#each guesses as guess, tryCount}
		<WordRow {guess} {tryCount} />
	{/each}
	<GuessRow bind:activeGuess />
</div>
