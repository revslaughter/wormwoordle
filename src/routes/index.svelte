<script>
	import ActiveRow from '$lib/components/ActiveRow.svelte';
	import WordRow from '$lib/components/WordRow.svelte';
	import { storeAnswer, findWord } from '$lib/util/store/chooseWord';
</script>

<WordRow guess={findWord()} tryCount={0} />
<WordRow guess={findWord()} tryCount={1} />
<WordRow guess={findWord()} tryCount={2} />
<WordRow guess={findWord()} tryCount={3} />
<WordRow guess={findWord()} tryCount={4} />
<WordRow guess={findWord()} tryCount={5} />
<WordRow guess={findWord()} tryCount={6} />
<WordRow guess={findWord()} tryCount={7} />
<ActiveRow />
