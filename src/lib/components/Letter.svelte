<script>
	export let char = '';

	/** @type {'dead' | 'new' | 'close | 'wrong' | 'right' | 'score'}*/
	export let status = 'dead';

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

		min-width: 1em;
		max-width: 2em;
		height: 2em;

		text-transform: uppercase;
		font-family: Helvetica, 'Segoe UI', sans-serif;
		font-size: 16pt;
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
	.score {
		box-shadow: none;
		border: 1px solid rgb(218, 218, 218);
		border-radius: 0%;

		font-size: 0.8em;

		justify-content: center;
		align-items: center;
	}
</style>
