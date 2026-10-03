import { asset } from '$app/paths';
import { createWordSource } from './words';

/** The word source the app uses: shards served from static/words. */
export const wordSource = createWordSource(async (file) => {
	// `asset()` only accepts paths it knows about, and these are generated at build time
	const response = await fetch(asset(`/words/${file}` as Parameters<typeof asset>[0]));
	if (!response.ok) throw new Error(`Couldn't load ${file} (${response.status})`);
	return response.text();
});
