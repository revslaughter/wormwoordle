<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { LetterStatus } from '#lib/game/analyze';
	import Key from './Key.svelte';

	interface Props {
		rows?: { char: string; status: LetterStatus }[][];
		onKey: (key: string) => void;
	}

	let { rows = [], onKey }: Props = $props();
</script>

<div class="keyboard" transition:slide|global={{ duration: 300 }}>
	{#each rows as row, i (i)}
		<div class="keebRow">
			{#each row as { char, status } (char)}
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
