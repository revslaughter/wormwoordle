<script>
	export let char = '';
	export let status = 'new';

	if (char === '') {
		status = 'dead';
	}
</script>

<div class="letterTile {status}">{char}</div>

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

		width: 2em;
		height: 2em;

		text-transform: uppercase;
		font-family: Helvetica, 'Segoe UI', sans-serif;
		font-size: 2em;
	}

	.new {
		background-color: rgb(218, 218, 218);
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
