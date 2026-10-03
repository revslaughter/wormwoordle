<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { LetterStatus } from '#lib/game/analyze';

	interface Props {
		char?: string;
		status?: LetterStatus | 'dead';
	}

	let { char = '', status = 'dead' }: Props = $props();

	// An empty tile is always dead
	const tileStatus = $derived(char === '' ? 'dead' : status);
</script>

<div class="letterTile {tileStatus}" in:fly|global={{ delay: 50, duration: 200, y: 50 }}>
	{char}
</div>

<style>
	.letterTile {
		display: grid;
		grid-row: 1;
		grid-column: auto;

		justify-content: center;
		align-items: center;

		border: 1px solid black;
		border-radius: 15%;

		box-shadow: 0px 0.0625em 0.125em rgb(148, 148, 148);

		min-width: 1em;
		max-width: 2em;
		height: 2em;

		text-transform: uppercase;
		font-family: Helvetica, 'Segoe UI', sans-serif;
		font-size: 16pt;
	}

	.new {
		background-color: var(--tile-new);
	}
	.close {
		background-color: var(--tile-close);
	}
	.wrong {
		background-color: var(--tile-wrong);
		color: var(--tile-wrong-text);
	}
	.right {
		background-color: var(--tile-right);
	}
	.dead {
		box-shadow: none;
		background-color: var(--tile-dead);
		border: 1px solid var(--tile-dead-border);
	}
</style>
