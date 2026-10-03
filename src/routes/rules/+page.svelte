<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import RulesModal from '#lib/components/RulesModal.svelte';
</script>

<RulesModal onClose={() => goto(resolve('/'))} />
