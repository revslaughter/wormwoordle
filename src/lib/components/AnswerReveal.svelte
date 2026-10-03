<script lang="ts">
	interface Props {
		word: string;
	}

	let { word }: Props = $props();
</script>

<!-- Each letter is a card that starts face-down and flips over, left to right -->
<div class="reveal" role="img" aria-label="The word was {word}">
	{#each [...word] as char, i (i)}
		<div class="card" style:--i={i} aria-hidden="true">
			<div class="face down">?</div>
			<div class="face up">{char}</div>
		</div>
	{/each}
</div>

<style>
	.reveal {
		display: flex;
		justify-content: center;
		gap: 2px;
		margin: 0.5em auto 1em;
		perspective: 600px;
	}

	.card {
		position: relative;
		width: 2em;
		height: 2em;
		transform-style: preserve-3d;
		animation: flip 700ms cubic-bezier(0.3, 0.7, 0.4, 1.2) both;
		animation-delay: calc(500ms + var(--i) * 160ms);
	}

	.face {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border: 1px solid black;
		border-radius: 15%;
		box-shadow: 0px 0.0625em 0.125em rgb(148, 148, 148);
		backface-visibility: hidden;
		text-transform: uppercase;
		font-family: Helvetica, 'Segoe UI', sans-serif;
		font-size: 16pt;
	}

	.down {
		background-color: var(--tile-new);
	}

	.up {
		background-color: var(--tile-right);
		transform: rotateY(180deg);
	}

	@keyframes flip {
		0% {
			transform: rotateY(0deg) translateY(0);
		}
		40% {
			transform: rotateY(90deg) translateY(-0.6em);
		}
		100% {
			transform: rotateY(180deg) translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			animation: none;
			transform: rotateY(180deg);
		}
	}
</style>
