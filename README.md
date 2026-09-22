# Kids Learning Apps

A collection of educational web applications for children learning to read in
**Russian, Belarusian and Ukrainian**.

## Language selection

The language is chosen on the home page — Русский (default), Беларуская,
Українська — and everything follows from it:

- **Letters**: each language gets its own alphabet (Belarusian has І and Ў but no
  И/Щ/Ъ; Ukrainian has І, Ї, Є but no Ы/Э/Ё/Ъ).
- **Orthography**: only syllables that actually exist are shown — ЖИ/ШИ and ЧА/ЩА
  in Russian, hard Ж/Ш/Ч/Р and дзеканне/цеканне in Belarusian, hard Ж/Ч/Ш/Щ and
  "Ї never after a consonant" in Ukrainian.
- **Word splitting**: the ДЗ/ДЖ digraphs stay together, Ў and the apostrophe are
  handled correctly.
- **Content**: separate word lists, sentences, чистоговорки and sample words.
- **Speech**: `ru-RU` / `be-BY` / `uk-UA`, falling back to the closest installed
  voice (be → uk → ru), because Belarusian voices are rarely installed.

The choice is stored in `localStorage`, so it survives a reload.

## Applications

### Слоги / Склады (`src/apps/syllables/`)

Reading single syllables. Choose the order (consonant + vowel, vowel + consonant,
or mixed), pick which letters to practise, optionally include soft-sign syllables,
then run flashcards or the 3D driving game. Each card can show a чистоговорка or
a sample word with the syllable highlighted.

### Популярные слова (`src/apps/popular-words/`)

The 1000 most common words of the chosen language, in frequency order, each split
into «склады» (max two letters): мо-я, иг-ра-ет. A range picker lets you work
through the list a hundred words at a time.

### Предложения (`src/apps/sentences/`)

Short graded sentences across four levels (100 per level), from «вот кот» to full
sentences, split into «склады» the same way.

#### Свой текст — read your own story

The level picker has a fifth entry, «📝 Свой текст». Type or paste any text and
the app turns it into cards: it splits on `.!?`, drops punctuation and digits,
turns hyphens into spaces (a hyphen is not a «склад») and cuts anything longer
than ten words into chunks. The text is kept in `localStorage`, so it survives a
reload.

The same panel can ask Claude to **write the story for you**: a topic (or one of
the preset chips), a length in words (20–150) and a sentence length (the same
four levels). It calls the Claude API straight from the browser with a key you
paste in yourself — the key lives only in that browser's `localStorage` and goes
to `api.anthropic.com` and nowhere else. Without a key nothing else changes: the
app stays entirely offline, and the SDK is only downloaded when you press
«Придумать рассказ».

All three share: uppercase/lowercase toggle, sound, background themes,
shuffle/in-order, show/hide hyphens, and keyboard navigation
(SPACE / ← → / ESC).

#### Ползунок — a slider to read along (words and sentences)

The 👆 button puts a slider under **every line** of the text — a progress bar
with a big thumb the child drags with a finger, so the finger never covers the
letters. Each bar is as wide as its own line and divided into one slot per
letter of that line; having finished a line, the child grabs the next slider
below. The current letter gets a pill, its «склад» a softer one, and everything
already read to the left (including the lines above) turns grey. With sound on,
every «склад» is pronounced as the thumb enters it. Dragging a slider does not
flip the card; tapping the text, the arrows, SPACE and ← → still do.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173/kids/
npm run build    # production build into dist/
```

## Project structure

```
src/
├── App.jsx                     — home page, routing, language picker
├── shared/
│   ├── i18n/                   — languages, UI strings, language context
│   ├── utils/                  — orthography, syllable generation, splitting, speech, Claude API
│   └── components/             — shared icons, ReadingText (склады + ползунок)
└── apps/
    ├── syllables/              — syllables app + чистоговорки and sample words
    ├── syllables-3d-game/      — the 3D driving game
    ├── popular-words/          — word lists (ru / be / uk)
    └── sentences/              — graded sentences (ru / be / uk)
```

`syllables-app/syllables-app.html` is the original standalone single-file version,
kept for reference.

## Technical details

- React 18 + React Router (hash routing, so it works from a static host)
- Tailwind CSS
- Vite build
- Web Speech API for text-to-speech

## License

This is an educational project for personal use.
