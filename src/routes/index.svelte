<script>
	import { flip } from 'svelte/animate';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import GuessRow from '$lib/components/GuessRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import Keyboard from '$lib/components/Keyboard.svelte';

	import lookupWord from '$lib/util/lookupWord';

	import { guesses, analyzedGuesses, activeGuess, winStatus } from '$lib/util/store/gameStatus';
	import { gameScore } from '$lib/util/store/score';
	import RulesModal from '$lib/components/RulesModal.svelte';

	let cheat = true;
	let showRules = false;
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key === 'Enter' && $activeGuess !== '' && lookupWord($activeGuess)) {
			$guesses = [...$guesses, $activeGuess];
			$activeGuess = '';
		}
	}}
/>

<div class="intro">
	<div class="menuButton"><MenuButton onMenuOpen={() => (showRules = !showRules)} /></div>
	<h1>WormWoodle 👹</h1>
	<h2>The variable-length <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a> clone</h2>
	<p>Take a guess, up to 10 letters!</p>
	<p>We'll let you know if it's too long or too short</p>
</div>

<hr />

{#if showRules}
	<RulesModal
		onClose={() => {
			showRules = !showRules;
		}}
	/>
{/if}

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
	.intro {
		max-width: 30rem;
		margin-left: auto;
		margin-right: auto;
	}
	hr {
		margin-top: 1.5em;
		margin-bottom: 2em;
	}
	.menuButton {
		text-align: right;
		margin-top: 7px;
		margin-right: 7px;
	}
	.winner {
		margin: auto;
		max-width: 30rem;
		text-align: center;
	}
	.winner button {
		font-size: large;
	}
</style>
