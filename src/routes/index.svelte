<script>
	import { flip } from 'svelte/animate';
	import GuessRow from '$lib/components/GuessRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import lookupWord from '$lib/util/lookupWord';
	import { guesses, analyzedGuesses, activeGuess, winStatus } from '$lib/util/store/gameStatus';
	import Keyboard from '$lib/components/Keyboard.svelte';
	import { gameScore } from '$lib/util/store/score';

	let cheat = true;
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
	{#if $winStatus === 'playing'}
		<GuessRow />
	{/if}
</div>

{#if $winStatus === 'playing'}
	<div id="Keyboard">
		<Keyboard />
	</div>
{/if}

{#if $winStatus === 'win'}
	<div class="winner">
		<h2>You're WIN! Score is {$gameScore}</h2>
		<button
			on:click={() => {
				$activeGuess = '';
				$guesses = [];
				$gameScore = 0;
				$winStatus = 'playing';
			}}
			>PLAY 👹 AGAIN
		</button>
	</div>
{/if}

<style>
	.winner {
		margin: auto;
		max-width: 30rem;
		text-align: center;
	}
	.winner button {
		font-size: large;
	}
</style>
