<script>
	import ActiveRow from '$lib/components/ActiveRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
</script>

<WordRow guess="abdicates" tryCount={0} />

<WordRow guess="abuse" tryCount={1} />

<WordRow guess="assess" tryCount={2} />

<WordRow guess="abscess" tryCount={3} />

<ActiveRow />
