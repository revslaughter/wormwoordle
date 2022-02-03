<script>
	import WordRow from '$lib/components/WordRow.svelte';
	import { storeAnswer } from '$lib/util/store/chooseWord';

	let activeGuess = '';
	let guesses = [];

</script>

<div id="Game">
	{#each guesses as guess, tryCount}
		<WordRow {guess} {tryCount} />
	{/each}
	<WordRow guess={activeGuess} status="active" />
</div>
