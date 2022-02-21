<script>
	export let char = '';
	export let handleKey;
</script>

<div class="key" on:click={() => handleKey(char)}>{char}</div>

<style>
	.key {
		flex-basis: 2em;
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
</style>
