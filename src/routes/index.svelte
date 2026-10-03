<script>
	import { flip } from 'svelte/animate';
	import { blur } from 'svelte/transition';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import Keyboard from '$lib/components/Keyboard.svelte';
	import RulesModal from '$lib/components/RulesModal.svelte';
	import ShareResult from '$lib/components/ShareResult.svelte';

	import { createGame } from '$lib/game/game';
	import { lengthHint } from '$lib/game/analyze';
	import { buildShareText } from '$lib/game/share';

	const game = createGame();
	const { answer, guesses, activeGuess, analyzedGuesses, keyboardStatus, status } = game;

	let showRules = false;

	$: shareText = buildShareText($guesses, $answer);
	$: activeLetters = [...$activeGuess].map((char) => ({ char, status: 'new' }));
</script>

<svelte:window on:keydown={(event) => game.pressKey(event.key)} />

<div class="intro">
	<div class="menuButton"><MenuButton onMenuOpen={() => (showRules = !showRules)} /></div>
	<h1>WormWord 👹</h1>
	<p>Take a guess, up to 10 letters!</p>
	<p>You get seven guesses.</p>
	<p>We'll let you know if it's too long or too short 😉</p>
</div>

<hr />

{#if showRules}
	<RulesModal onClose={() => (showRules = false)} />
{/if}

<div id="Game">
	{#each $analyzedGuesses as letters, tryCount (tryCount)}
		<div animate:flip in:blur={{ duration: 400 }}>
			<WordRow {letters} hint={lengthHint($guesses[tryCount], $answer)} />
		</div>
	{/each}
	{#if $status === 'playing'}
		<WordRow letters={activeLetters} />
	{/if}
</div>

{#if $status === 'playing'}
	<div id="Keyboard">
		<Keyboard rows={$keyboardStatus} onKey={game.pressKey} />
	</div>
{/if}

{#if $status === 'win'}
	<div class="winner">
		<h2>You're WIN!</h2>
		<ShareResult text={shareText} />
		<button on:click={game.reset}>PLAY 👹 AGAIN</button>
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
