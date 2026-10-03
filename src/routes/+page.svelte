<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { blur } from 'svelte/transition';
	import MenuButton from '#lib/components/MenuButton.svelte';
	import WordRow from '#lib/components/WordRow.svelte';
	import Keyboard from '#lib/components/Keyboard.svelte';
	import RulesModal from '#lib/components/RulesModal.svelte';
	import ShareResult from '#lib/components/ShareResult.svelte';
	import AnswerReveal from '#lib/components/AnswerReveal.svelte';

	import { Game } from '#lib/game/game.svelte';
	import { wordSource } from '#lib/game/wordSource';
	import { lengthHint } from '#lib/game/analyze';
	import { buildShareText } from '#lib/game/share';

	const game = new Game(wordSource);

	// Load the answer in the browser only; the page is also prerendered at build time
	onMount(game.start);

	let showRules = $state(false);

	/** Physical keyboard input. Browser shortcuts and the rules modal take priority over the game. */
	const onKeydown = (event: KeyboardEvent) => {
		if (showRules || event.metaKey || event.ctrlKey || event.altKey) return;
		// Enter or Space on a focused button should press that button, not also submit a guess
		const onButton = event.target instanceof Element && event.target.closest('button');
		if (onButton && (event.key === 'Enter' || event.key === ' ')) return;
		game.pressKey(event.key);
	};

	const shareText = $derived(buildShareText(game.guesses, game.answer));
	const activeLetters = $derived(
		[...game.activeGuess].map((char) => ({ char, status: 'new' as const }))
	);
</script>

<svelte:window onkeydown={onKeydown} />

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

<p class="notice" role="status">{game.notice}</p>

<div id="Game">
	{#each game.analyzedGuesses as letters, tryCount (tryCount)}
		<div animate:flip in:blur={{ duration: 400 }}>
			<WordRow {letters} hint={lengthHint(game.guesses[tryCount], game.answer)} />
		</div>
	{/each}
	{#if game.status === 'playing'}
		<WordRow letters={activeLetters} />
	{/if}
</div>

{#if game.status === 'playing'}
	<div id="Keyboard">
		<Keyboard rows={game.keyboardStatus} onKey={game.pressKey} />
	</div>
{/if}

{#if game.status === 'win'}
	<div class="winner">
		<h2>You're WIN!</h2>
		<ShareResult text={shareText} />
		<button onclick={game.reset}>PLAY 👹 AGAIN</button>
	</div>
{/if}

{#if game.status === 'lose'}
	<div class="loser">
		<h2>The worm got you 👹</h2>
		<p>The word was</p>
		<AnswerReveal word={game.answer} />
		<ShareResult text={shareText} />
		<button onclick={game.reset}>PLAY 👹 AGAIN</button>
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
	.notice {
		min-height: 1.5em;
		margin: 0 0 0.5em;
		text-align: center;
		font-weight: bold;
	}
	.winner,
	.loser {
		margin: auto;
		max-width: 30rem;
		text-align: center;
	}
	.winner button,
	.loser button {
		font-size: large;
	}
</style>
