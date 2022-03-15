<script>
	import SETTINGS from '$lib/util/store/settings';
	import MenuClose from './MenuClose.svelte';

	export let onClose;
</script>

<div class="container">
	<div class="rules">
		<div class="closeButton"><MenuClose {onClose} /></div>
		<h1>Rules</h1>
		<h2>Find the WormWoodle</h2>
		<ul>
			<li>The answer will be between 3 and 10 letters</li>
			<li>Take as many guesses as you like! (Just watch your score)</li>
		</ul>
		<h2>Scoring</h2>
		<ul>
			<li><span class="right">3 points</span> for a right letter guess</li>
			<li><span class="close">1 point</span> for the right letter in the wrong location</li>
			<li>3 points for right length of guess ⸱</li>
			<li>10 points for winning!</li>
			<!-- 			<li>-5 points for giving up</li> -->
			<li>
				If you take too many guesses, you'll be penalized! Try to get it within {SETTINGS.PAR} guesses!
			</li>
		</ul>
	</div>
</div>

<style>
	h1 {
		margin: auto;
		max-width: fit-content;
		margin-block-start: 0.25em;
		text-decoration: underline;
	}
	h2 {
		margin-block-end: 0.2em;
	}
	ul {
		margin-block-start: 0.3em;
	}
	.container {
		z-index: 9999;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #4448;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rules {
		max-width: 24rem;
		max-height: 24rem;
		margin: auto;
		overflow: scroll;

		position: relative;
		border-radius: 6px;
		background: white;
		border: 1px solid #000;
		filter: drop-shadow(0px 0px 10px #555);
		padding: 1em;
	}

	.closeButton {
		text-align: right;
		position: absolute;
		top: 6px;
		right: 12px;
	}

	.right {
		background-color: rgb(95, 190, 95);
	}
	.close {
		background-color: rgb(236, 236, 83);
	}
</style>
