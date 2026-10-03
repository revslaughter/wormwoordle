<script>
	/** The text to show and copy. */
	export let text = '';

	let copied = false;

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
<button on:click={copy}>{copied ? 'COPIED ✔' : 'COPY RESULT 📋'}</button>

<style>
	pre {
		font-family: inherit;
		line-height: 1.4;
		user-select: all;
	}
	button {
		font-size: large;
	}
</style>
