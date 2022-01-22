<script>
	import Letter from '$lib/Letter.svelte';
</script>

<div class="wordRow">
	<Letter char="a" status="right" />
	<Letter char="c" status="wrong" />
	<Letter char="r" status="close" />
	<Letter char="o" status="close" />
	<Letter char="b" status="close" />
	<Letter char="a" status="close" />
	<Letter char="t" status="close" />
	<Letter char="➟" />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
</div>

<div class="wordRow">
	<Letter char="a" status="right" />
	<Letter char="b" status="right" />
	<Letter char="b" status="right" />
	<Letter char="a" status="close" />
	<Letter char="➟" />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
</div>

<div class="wordRow">
	<Letter char="t" status="wrong" />
	<Letter char="o" status="close" />
	<Letter char="y" status="wrong" />
	<Letter char="➟" />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
	<Letter />
</div>

<div class="wordRow">
	<Letter char="a" status="right" />
	<Letter char="b" status="right" />
	<Letter char="b" status="right" />
	<Letter char="r" status="right" />
	<Letter char="e" status="right" />
	<Letter char="v" status="right" />
	<Letter char="i" status="right" />
	<Letter char="a" status="right" />
	<Letter char="t" status="right" />
	<Letter char="i" status="right" />
	<Letter char="o" status="right" />
	<Letter char="n" status="right" />
</div>

<style>
	.wordRow {
		width: 80%;
		margin-top: 0.5em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 0.5em;
		display: grid;

		font-size: xx-large;
		grid-template-columns: repeat(12, 12fr);
	}
</style>
