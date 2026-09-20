# CLAUDE.md - Development Guide for AI Assistants

## Project Context

This is a collection of educational web applications for children learning to read
in **Russian, Belarusian and Ukrainian**. The language is chosen on the home page
and drives everything: the alphabet, the orthography rules, the words and
sentences, the UI strings and the text-to-speech voice.

## Architecture Principles

### 1. One Vite app, several small apps inside it
- `src/apps/<name>/` — one directory per learning app
- `src/shared/` — everything reused: i18n, orthography, syllable utils, icons
- Hash routing (`HashRouter`), so the build works from any static host
- `npm run dev` to develop, `npm run build` to produce `dist/`

### 2. Technology Stack
- **React 18** + **React Router** (hash routing)
- **Tailwind CSS**: Styling
- **Vite**: dev server and build
- **three.js**: the 3D syllable game
- **Web Speech API**: Text-to-speech for audio features

### 3. Target Audience
- Young children learning to read in Russian, Belarusian or Ukrainian
- Parents/teachers supervising learning
- Simple, intuitive interfaces with large, clear visuals

## Multi-language architecture (ru / be / uk)

The app teaches reading in **three languages**: Russian (default), Belarusian and
Ukrainian. The language is picked on the home page and lives in a React context.

### Where the language lives

- `src/shared/i18n/languages.js` — the list of languages: code, native name, flag,
  Web Speech code and fallback voices, `<html lang>` value.
- `src/shared/i18n/LanguageContext.jsx` — `<LanguageProvider>` + `useLanguage()`.
  Returns `{ lang, setLang, language, t, fill }`. Persists to `localStorage`
  (`kids-apps-language`) and keeps `document.documentElement.lang` in sync.
- `src/shared/i18n/ui.js` — every visible UI string, in all three languages.
  Same key tree per language; `fill('Выбрано: {n}', { n })` for placeholders.
- `src/shared/i18n/LanguageSwitcher.jsx` — the three-way picker on the home page.

**Any new user-visible string goes into `ui.js` in all three languages** — never
hardcode text in a component.

### Language-aware utilities

Every one of these takes a `lang` code (`'ru' | 'be' | 'uk'`) and falls back to
the default language for anything unknown:

- `src/shared/utils/orthography.js` — the alphabets and orthography rules:
  `getConsonants`, `getVowels`, `getInitialVowels`, `getSoftSign`, `isConsonant`,
  `isVowel`, `isValidSyllable`, `canTakeSoftSign`.
- `src/shared/utils/syllables.js` — syllable generation (`{ …, lang }` in options).
- `src/shared/utils/syllableSplit.js` — `splitToWarehouses(word, lang)`.
- `src/shared/utils/speech.js` — `speak(text, { lang })`, `speakSyllable(s, onEnd, lang)`.

### Orthography rules per language

**Russian** (20 consonants, 10 vowels, Ь + Ъ):
1. ЖИ, ШИ (never ЖЫ, ШЫ)
2. ЧА, ЩА (never ЧЯ, ЩЯ)
3. ЧУ, ЩУ (never ЧЮ, ЩЮ)
4. After Ж, Ш, Ч, Щ, Ц never Э
5. Ь not after Г, К, Х, Ц

**Belarusian** (19 consonants — no Щ; І instead of И; Ў never opens a syllable):
1. Ж, Ш, Ч, Р are always hard: ЖЫ/ШЫ/ЧЫ/РЫ, ЖЭ/ШЭ/ЧЭ/РЭ, never ЖІ/ШЯ/ЧЮ/РЕ
2. Дзеканне/цеканне: no soft Д or Т — ДЗ and Ц instead (дзень, ціха)
3. Г, К, Х are soft only before І and Е; never with Я, Ё, Ю, Ы
4. Ь only after З, Л, Н, С, Ц
5. ДЗ and ДЖ are one sound and are never split across «склады»

**Ukrainian** (20 consonants — Ґ excluded as too rare; І, Ї, Є; no Ы, Э, Ё, Ъ):
1. Ж, Ч, Ш, Щ are always hard: ЖИ/ЧИ/ШИ/ЩИ and ЖІ/ЧІ/ШІ/ЩІ, never ЖЯ/ЧЮ/ШЄ
2. Ї never follows a consonant (їжак, мої, з'їв)
3. Г, К, Х are hard: no ГЯ, КЮ, ХЄ
4. Є after a consonant only in Л, Н, Т (синє, останнє, життєвий); after a labial
   it needs an apostrophe (б'є, п'є)
5. Ь only after Д, З, Л, Н, С, Т, Ц
6. ДЗ and ДЖ are one sound and are never split

### Per-language content

Each content module holds one map/list per language and exposes a `lang`-aware
getter:

- `src/apps/syllables/chistogovorki.js` — `getChistogovorka(syllable, lang)`
- `src/apps/syllables/words.js` — `getWordForSyllable(syllable, lang)`
- `src/apps/popular-words/wordsData.{ru,be,uk}.js` + `wordsData.js`
  (`getPopularWords(lang)`) — 1000 words each, stored as **whole words**; the app
  splits them at render time with the language-aware splitter
- `src/apps/sentences/sentencesData.{ru,be,uk}.js` + `sentencesData.js`
  (`getSentenceLevels(lang)`, `getAllSentences(lang)`) — 4 levels × 100 sentences

Sentences and words are stored lowercase, without punctuation.

## Current Apps

### Syllables (`src/apps/syllables/`)

Flashcards of single syllables plus a 3D driving game
(`src/apps/syllables-3d-game/`). Users choose CV / VC / mixed order, which letters
to practise (empty selection = all), and whether to include soft-sign syllables.
Under the card the app shows a чистоговорка, or a sample word with the syllable
highlighted.

### Reading a line with a finger — `src/shared/components/ReadingText.jsx`

Both the words and the sentences app render their text through `ReadingText`: it
splits every word into «склады» (colouring vowels red and consonants blue) and,
when `tracking` is on, adds the «ползунок» — the reading.com-style finger
tracker. It measures every letter's box, picks the nearest line and then the
nearest letter to the pointer (so the finger may slide *under* the text),
highlights that letter and its «склад» with absolutely-positioned overlays (no
layout shift), and calls `onSyllable` when the finger enters a new «склад» — the
apps use that to pronounce it when sound is on. `onInteract` tells the app that
a drag happened, so a pointer released outside the card is not taken for a
«next card» click.

### Popular Words (`src/apps/popular-words/`)

The 1000 most frequent words of the chosen language, split into «склады»
(max two letters, Zaitsev-style). Has a range picker (0–100, 100–200, …), a
shuffle/in-order toggle and browser-like back/forward history.

### Sentences (`src/apps/sentences/`)

Graded sentences over four levels, split into «склады» the same way.

### Legacy standalone app (`syllables-app/syllables-app.html`)

The original single-file version, kept for reference. It is **not** part of the
Vite app and does not have the language picker.

## Development Guidelines

### Adding New Apps

1. Create a directory under `src/apps/<app-name>/` with the app component.
2. Register a route in `src/App.jsx` and add a card to the home page — its title
   and description come from `t.apps.*` in `src/shared/i18n/ui.js`.
3. Take the language from `useLanguage()` and pass it to every shared util
   (orthography, syllable split, speech) — never assume Russian.
4. Put new UI strings in `ui.js` for **all three** languages.
5. If the app has language content (words, sentences, …), keep one file per
   language plus an index module with a `lang`-aware getter, as the existing apps do.
6. Reuse the shared pieces: `BACKGROUNDS` from `src/apps/syllables/constants.js`,
   icons from `src/shared/components/Icons.jsx`, speech from
   `src/shared/utils/speech.js`.

Keep the standard controls consistent across apps: counter, case toggle (АБ/аб),
sound, background, menu; SPACE / click for next, ← → to page, ESC to leave.
Apps that show words or sentences also get the 👆 «ползунок» toggle and render
their text with `ReadingText`.

### Code Style

- Use functional React components with hooks
- Keep state management simple (useState, useEffect)
- Inline styles or Tailwind classes (no separate CSS files)
- Clear, descriptive variable and function names
- Comments for complex logic or domain-specific rules

### Testing

- `npm run dev` and check the app in the browser; `npm run build` must pass
- Test all three languages: letters, syllables, words and sentences change with
  the picker on the home page
- Test in multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (responsive design)
- Test keyboard navigation
- Test audio features (if applicable)
- Verify that app works without internet after initial load (cached CDN resources)

## Future Considerations

As more apps are added:
- Keep extracting shared components and utilities into `src/shared/`
- Could add common UI patterns (settings panel shared between apps)
- More languages: add an entry to `languages.js`, an alphabet to
  `orthography.js`, a branch to `ui.js`, and content files per app
- Consider offline functionality (Service Workers)

## Language Notes

- `<html lang>` is set from the chosen language by `LanguageProvider` — don't
  hardcode it.
- Never assume the Russian alphabet: get letters from
  `src/shared/utils/orthography.js`, not from a literal list.
- Respect each language's orthography — the rules above are already encoded in
  `orthography.js`; extend that file rather than special-casing in components.
- Speech: `ru-RU`, `be-BY`, `uk-UA`. Belarusian (and often Ukrainian) voices are
  not installed on most systems, so `speech.js` picks the closest available voice
  (be → uk → ru).
- Belarusian spelling gotchas: аканне/яканне (вада, вясна), дзеканне/цеканне
  (дзень, ціха), Ў after a vowel (воўк, аўтобус), apostrophe instead of Ъ.
- Ukrainian spelling gotchas: apostrophe before Я/Ю/Є/Ї after a labial (м'яч,
  п'ять), И never starts a word, Ї only at the start or after a vowel.

## Git Workflow

- Main branch: `master`
- Commit messages should be descriptive
- Each app addition should be a separate commit
- Update README.md when adding new apps
