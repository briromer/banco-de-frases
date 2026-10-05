# Banco de Frases

A personal Spanish study tool: two "sides of the cassette" —

- **Lado A — Frases**: native "glue phrases" (reactions, subjunctive triggers,
  hedges, connectors, fillers) that aren't idioms but are what makes speech
  sound native rather than textbook-correct.
- **Lado B — Cognados**: "free" sophisticated vocabulary — words that ride in
  almost for free because of shared Latin/Greek roots with English
  (convicción, melancolía, escrúpulos...), grouped by reliable suffix pattern
  (-ción→-tion, -mente→-ly, etc.) plus a literary/root-recognition family for
  higher-register words without a clean suffix rule, and a "false friends"
  family for the traps that look like cognates but aren't.

No build step. No dependencies beyond two Google Fonts. Open `index.html`
directly in a browser, or serve the folder with any static server (e.g. the
VS Code "Live Server" extension) to avoid `file://` quirks with fonts.

## Structure

```
index.html        — page shell + markup for all four views (Explorar,
                     Tarjetas, Quiz, Mis frases), both modules share one set
                     of views
css/style.css      — all styling. Cassette-tape / lyric-booklet aesthetic:
                     paper cream background, teal + mustard + rust accents,
                     Fraunces (display serif) + Work Sans (UI grotesk)
js/data.js         — ALL CONTENT lives here. Two independent arrays:
                       CATS_FRASES / DATA_FRASES
                       CATS_COGNADOS / DATA_COGNADOS
                     Add a new phrase or cognate by adding one object to the
                     relevant DATA_* array. No other file needs to change.
js/app.js          — the shared engine: module switching, category filters,
                     search, flashcards, quiz, and the "Mis frases" add-form.
                     Reads MODULES config at the top to know how each module
                     behaves (which quiz type, which storage keys).
```

## How progress is stored

Everything is `localStorage`, scoped to whatever browser/device you're using
it in — there's no backend, no sync. Two kinds of data per module:

- **Progress** (`banco_progress_v1` / `cognados_progress_v1`): per-item
  status (`new` / `learning` / `known`), set from the flashcard buttons or
  from answering a quiz question.
- **Mine** (`banco_mine_v1` / `cognados_mine_v1`): your own logged phrases —
  the "Mis frases" tab. Structurally identical to the built-in data.
- **Quiz history** (`banco_quiz_v1` / `cognados_quiz_v1`): per-item right/wrong
  counts, all-time totals and best streak. Shown under the quiz (session score,
  streak, accuracy per category, most-missed items) and as a `quiz 3✓ 1✗` chip
  on each card in Explorar. "borrar historial del quiz" resets one side.
- **Prefs** (`banco_prefs_v1`): the 🔀 aleatorio (shuffle cards) and
  🎯 priorizar fallos (quiz pulls missed/unseen items more often) toggles,
  remembered per side. With priorizar fallos off, the quiz deals from a
  shuffled deck with no repeats until the deck runs out.

Keyboard: in Quiz, `1`–`4` answer and `Enter` goes to the next question; in
Tarjetas, `Space` flips and `←`/`→` move.

## Ideas for extending this in Claude Code

Things that would be natural next steps if you want to keep building:

1. **Real spaced repetition.** Right now "aún aprendiendo" / "ya la sé" is
   binary. A proper SM-2-style scheduler (interval grows on correct answers,
   resets on misses) would make the flashcard/quiz modes much stickier.
2. **Export/import your "Mis frases" data** as JSON, so it isn't trapped in
   one browser's localStorage.
3. **A third module** for something like verb-conjugation drills, or
   register/formality pairs (tú vs. usted phrasing) — the MODULES pattern in
   `app.js` is built so a third module is just a new data.js array + a new
   entry in the `MODULES` object + a new side-switch button.
4. **Audio.** Pulling in a text-to-speech call so you can hear each phrase
   said aloud, not just read it, would help a lot given the whole point of
   this module is training your ear for native rhythm.
5. **Weighting in flashcards too** — the quiz already has a weak-first mode
   (🎯 priorizar fallos); the flashcards could use the same quiz history.

## Content notes

- No song lyrics or copyrighted text are reproduced anywhere in `data.js` —
  the `hint`/`note` fields describe *where* a pattern tends to show up
  (genre, register, type of scene) rather than quoting a specific line, and
  all example sentences are original.
- The optional `reg` field on Lado A entries (`MX` / `CO` / `ES` / `LATAM`)
  marks regional phrases; untagged = general. Mexican forms are preferred and
  were checked against Mexico City speech — see
  `research/lado-a-prior-art.md` for sources and method.
- The `rel` field on cognate entries (`alta` / `media` / `falso`) is a rough
  reliability signal: `alta` = the suffix pattern is dependable across many
  words, `media` = recognizable but the mapping isn't exact (e.g.
  convincente → convincing, not "convincent"), `falso` = this is a false
  friend, flagged on purpose so it doesn't get memorized as a real cognate.
