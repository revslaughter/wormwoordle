<script>
	import { slide } from 'svelte/transition';
	import Key from './Key.svelte';

	/** @type {{ char: string, status: string }[][]} */
	export let rows = [];
	/** @type {(key: string) => void} */
	export let onKey;
</script>

<div class="keyboard" transition:slide={{ duration: 300 }}>
	{#each rows as row}
		<div class="keebRow">
			{#each row as { char, status }}
				<Key {char} {status} {onKey} />
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
