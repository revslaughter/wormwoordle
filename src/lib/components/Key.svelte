<script lang="ts">
	import type { LetterStatus } from '#lib/game/analyze';

	interface Props {
		char?: string;
		onKey: (key: string) => void;
		status?: LetterStatus;
	}

	let { char = '', onKey, status = 'new' }: Props = $props();
</script>

<div
	class={(char === '⏎' || char === '⌫' ? 'key wider' : 'key') + ' ' + status}
	onclick={() => onKey(char)}
>
	{char}
</div>

<style>
	.key {
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

		background-color: rgb(152, 172, 192);
	}
	.wider {
		flex-basis: 4rem;
		font-size: 14pt;
	}
	.close {
		background-color: rgb(236, 236, 83);
	}
	.wrong {
		background-color: rgb(65, 65, 65);
		color: whitesmoke;
	}
	.right {
		background-color: rgb(95, 190, 95);
	}
	.dead {
		box-shadow: none;
		background-color: rgb(233, 233, 233);
		border: 1px solid rgb(218, 218, 218);
	}
</style>
