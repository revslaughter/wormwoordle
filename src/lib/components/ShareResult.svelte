<script lang="ts">
	interface Props {
		/** The text to show and copy. */
		text?: string;
	}

	let { text = '' }: Props = $props();

	let copied = $state(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard can be unavailable (e.g. insecure context); the text is still selectable.
		}
	};
</script>

<pre>{text}</pre>
<button onclick={copy}>{copied ? 'COPIED ✔' : 'COPY RESULT 📋'}</button>

<style>
	pre {
		font-family: inherit;
		line-height: 1.4;
		/* The parent centres its text; keep the rows aligned with each other, with the block centred */
		text-align: left;
		width: fit-content;
		margin-inline: auto;
		user-select: all;
	}
	button {
		font-size: large;
	}
</style>
