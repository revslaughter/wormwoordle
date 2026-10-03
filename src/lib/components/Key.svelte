<script lang="ts">
	import type { LetterStatus } from '#lib/game/analyze';

	interface Props {
		char?: string;
		onKey: (key: string) => void;
		status?: LetterStatus;
	}

	let { char = '', onKey, status = 'new' }: Props = $props();

	const LABELS: Record<string, string> = { '⏎': 'Enter', '⌫': 'Delete' };
</script>

<!-- pointerdown is cancelled so a mouse click doesn't leave the key focused,
	which would make a later physical Enter press it again -->
<button
	type="button"
	class={(char === '⏎' || char === '⌫' ? 'key wider' : 'key') + ' ' + status}
	aria-label={LABELS[char]}
	onpointerdown={(event) => event.preventDefault()}
	onclick={() => onKey(char)}
>
	{char}
</button>

<style>
	.key {
		cursor: pointer;
		flex-basis: 2rem;
		display: flex;

		text-align: center;
		justify-content: center;
		align-items: center;

		border: 1px solid black;
		border-radius: 4px;

		padding: 0.25em;

		text-transform: capitalize;
		font-family: Helvetica, 'Segoe UI', sans-serif;
		font-size: 12pt;

		background-color: var(--key);
	}
	.wider {
		flex-basis: 4rem;
		font-size: 14pt;
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
