# WormWord 👹

A Wordle-style game with a twist: the answer can be anywhere from 3 to 10 letters long, and
you have to work out the length as well as the word.

- Guess any word up to 10 letters. You get 7 guesses.
- Each letter turns green (right place), yellow (elsewhere in the word) or dark (not in the word).
- After each guess a hint says whether the answer is longer (⇢) or shorter (⇠) than your guess.
- Win and you get a spoiler-free emoji summary to copy and share. Lose and the worm reveals the word.

Built with [SvelteKit](https://svelte.dev/docs/kit) 3, Svelte 5 (runes) and TypeScript. It's a fully
client-side app, built to static files with `adapter-static`.

## Develop

```sh
npm install
npm run dev       # dev server
npm test          # unit tests (Vitest)
npm run check     # type-check Svelte and TypeScript
npm run lint      # Prettier + ESLint
npm run build     # static site in build/, preview with `npm run preview`
```

## How it's organised

```
src/lib/game/        Game logic, with no UI
  game.svelte.ts       The Game class: state, derived values and the pressKey/reset actions
  analyze.ts           Scoring a guess against the answer, and the length hint
  share.ts             The emoji result
  words.ts             Word source: validates guesses and picks answers from word shards
  wordSource.ts        The word source the app uses (fetches shards from static/words)
  settings.ts          Word length, guess limit and keyboard layout
src/lib/components/  Presentational components; they take props and know nothing about the rules
src/routes/          The page, which creates a Game and wires it to the keyboard
data/                Source word list (2of12inf)
static/words/        Generated word shards (see below)
scripts/             build-words.mjs, which generates the shards
```

## The word list

The ~60,000-word list is split into small files by length and first letter
(`static/words/8-s.txt`, ...) plus an `index.json` of counts, and the game fetches only what it
needs: one shard to pick the answer, and one per guess it checks. That keeps the list out of the
JavaScript bundle.

The shards are generated from `data/2of12inf.json` and committed. After changing the list or the
length limits in `src/lib/game/settings.ts`, run:

```sh
npm run words
```

The tests check that the committed shards match the source list, so they can't drift unnoticed.
(The length limits are also in `scripts/build-words.mjs`; keep the two in step.)

The word list is [2of12inf](http://wordlist.aspell.net/12dicts/) from the 12dicts project.

## Deploying to GitHub Pages

The site is served from the `gh-pages` branch at `/wormwoordle/`. To redeploy, build with the base path
(`BASE_PATH=/wormwoordle npm run build`), then replace the contents of `gh-pages` with `build/`
(plus an empty `.nojekyll` file, since GitHub Pages ignores `_app`'s underscore folder otherwise).
