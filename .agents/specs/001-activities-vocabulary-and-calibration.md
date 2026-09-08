---
id: 001
title: First-letter vocabulary, digit tracing, subtraction and age-band calibration
status: in-progress
created: 2026-09-08
owner: orioltomas
hard_rules: [HR-002, HR-003, HR-004, HR-005, HR-006, HR-007, HR-008, HR-009]
---

# First-letter vocabulary, digit tracing, subtraction and age-band calibration

## Context

*Aprèn en Calma* is a single-file offline PWA (`index.html`, ~48 KB, plus `sw.js`,
`manifest.webmanifest`, `fonts/`, `test.js`). All logic lives in one `<script>` block.
`test.js` executes that real script inside a minimal fake DOM, so tests cannot drift
from what ships.

What is true today:

- **`buildFirstLetterRound()` has no vocabulary of its own.** It builds items from
  `SHAPES` (8 entries) + `COLORS` (8 entries), so the game has 16 fixed words with only
  12 distinct initials, 4 of them repeated (C, T, R, V). Fifteen letters never appear:
  A Ç F H I J K N P S U W X Y Z. A child exhausts the set in two sessions and never sees
  the letter A.
- **`screen-letters` is almost generic.** The canvas, the guide glyph, `initTrace()`,
  `sizeTrace()`, `drawGuideLetter()`, "netejar" and the arrows know nothing about
  letters. The only letter-specific parts are `letters()`, `letCase` and `#case-toggle`.
- **`QUIZZES`** is a registry of `{title, rounds, build}`; **`ACTS`** is a registry of
  `{sym | icon, name, open}`; **`AGE_ACTIVITIES`** maps band → activity ids.
- **Calibration lives in one-line functions**: `maxNumber()`, `memoryConfig()`,
  `seqCount()`, `SEQ_ROUNDS = 6`.
- **`buildSumRound()`** shows `clusterHTML(a) + '+' + clusterHTML(b)` and asks for the
  total, with `optClass: 'text'` numeric options.
- **`SHAPES`** entries are `{name, color, path: c => '<svg-children>'}` rendered by
  `shapeHTML(i, color, size)` on a `0 0 40 40` viewBox.
- **Radii**: `.age-btn`, `.opt` and `.seq-card` are 16px; the approved mockups use 14px
  and 12px.

## Goal

Give «primera lletra» a real vocabulary so it teaches the Catalan alphabet instead of
recycling shape and colour names; let children trace digits with the machinery that
already exists for letters; add subtraction; and correct four calibration points that
make bands feel uneven.

## Scope

### In
- A dedicated drawn vocabulary for «primera lletra» (24 initial-letter entries).
- Middle-of-word rounds inside «primera lletra» teaching Ç and NY (5 more entries).
- A new «xifres» activity: tracing the digits 0-9.
- A new «restar» activity for the 6-7 band.
- Memory at 6-7 drops from 8 pairs to 6.
- «ordenar» becomes available in the 2-3 band.
- Radii aligned with the approved mockups.

### Out
- K, W and Y in «primera lletra» (HR-005).
- «primera lletra» in the 2-3 and 4-5 bands (HR-007).
- Tracing multi-digit numbers (HR-008).
- Any audio, score, timer or reward (HR-001, HR-004).
- Changing `SHAPES` or `COLORS`, which remain the source for «formes», «colors»,
  «patrons» and «què hi sobra».

## Actors & permissions

| Actor | Can | Cannot |
|---|---|---|
| Child | Play every activity offered to the band chosen on the entry screen | Change band, theme or letter case; those controls live only on the entry screen |
| Adult | Choose the band, the uppercase toggle and light/dark on the entry screen | — |

## Behaviour

### A. «primera lletra» vocabulary

1. A new `VOCAB` array replaces `SHAPES`+`COLORS` as the source of
   `buildFirstLetterRound()`. Each entry is `{word, letter, path}` where `path` follows
   the `SHAPES` convention: a function returning SVG children on a `0 0 40 40` viewBox,
   filled with the colour passed in, so it inherits the theme.
2. A round picks one entry, shows its drawing as the target, and offers four uppercase
   letter options: the correct initial plus three distinct wrong letters from
   `BASE_LETTERS`.
3. On a correct answer the word is revealed, as today (`reveal`).

The 24 initial-letter entries:

| Letter | Word | Letter | Word | Letter | Word |
|---|---|---|---|---|---|
| A | aranya | I | illa | R | roda |
| B | bota | J | jaqueta | S | sol |
| C | casa | L | lupa | T | tortuga |
| D | dau | LL | lluna | U | ull |
| E | estrella | M | mà | V | vaca |
| F | flor | N | nas | X | xocolata |
| G | gat | O | ou | Z | zebra |
| H | helicòpter | P | peix | | |
| | | Q | quadrat | | |

`estrella` and `quadrat` can reuse the existing `SHAPES` paths, so 22 drawings are new.

**L vs LL**: most common Catalan L-words begin with the digraph `ll`, so `lupa` carries
L and `lluna` carries LL. LL is only offered when it is in the band's alphabet
(`EXTRA_LETTERS`, 6-7 only) — which it always is, since the activity is 6-7 only.

### B. Middle-letter rounds (Ç and NY)

1. Roughly **one round in four** is a middle-letter round, chosen at random per round.
2. A middle-letter round shows the drawing **and** the written word with the target
   letter replaced by a gap, e.g. `munta_a`, and asks for the missing letter.
3. Four options: the correct letter plus three distractors drawn from a confusable set —
   `{C, S, Z}` for Ç and `{N, Y, LL}` for NY — so the choice teaches the distinction
   rather than testing luck.

The 5 middle-letter entries: `braç`, `llaç` (Ç); `muntanya`, `pinya`, `canya` (NY).

### C. «xifres» — tracing digits

1. New tile named **`xifres`** with the text symbol `1 2 3` (a taught glyph, so Andika),
   offered to the **4-5 and 6-7** bands.
2. It reuses `screen-letters` through a mode variable rather than a new screen: the
   glyph strip, canvas, guide glyph, "netejar" and arrows are shared.
3. The sequence is `1 2 3 4 5 6 7 8 9 0` — a child learns to form 1 first and 0 last.
4. `#case-toggle` is hidden in digit mode.
5. Only the digit is shown; no number word, mirroring «lletres», which shows only the
   letter.

### D. «restar» — subtraction

1. New tile named **`restar`** for the **6-7** band only, with its own 8 rounds,
   registered in `QUIZZES` beside `sums`.
2. A round shows a group of `a` dots of which `b` are dimmed, and asks how many are
   left, with four numeric options.
3. `a` is at most 10 and the result is always 1 or more (HR-009).
4. The tile symbol and the operator use the **ASCII hyphen-minus** `-`, not U+2212,
   which is not guaranteed to be in the shipped Andika latin subset.

### E. Calibration

1. `memoryConfig()` returns 6 pairs (not 8) for the 6-7 band; columns stay 4.
2. `AGE_ACTIVITIES[2]` gains `sequence`.
3. `.age-btn` radius 16px → 14px; `.opt` and `.seq-card` 16px → 12px.

## Edge cases & error handling

| Case | Expected behaviour |
|---|---|
| A middle-letter round is picked but no Ç/NY entry is available | Fall back to an initial-letter round; never render an empty round |
| Fewer than 4 distinct options can be built | Never happens: `BASE_LETTERS` has 27 entries and the confusable sets have 3; assert in tests |
| The gap character in a middle-letter word | Render as `_`, styled so it reads as a slot, never as an underscore that looks like part of the word |
| A digit's guide glyph before Andika has loaded | Redrawn on `document.fonts.ready`, as `drawGuideLetter()` already does |
| Subtraction where `a - b` would be 0 or negative | Regenerate `b` until the result is 1 or more |
| «ordenar» in the 2-3 band | `seqCount()` already returns 3 for any band that is not 6-7; no change needed |
| A word's drawing is missing | Must not be possible: every `VOCAB` entry carries its own `path` |

## Data model

No persistence, no migration. Three new in-memory constants in the single `<script>`:

- `VOCAB` — 24 `{word, letter, path}` entries for initial-letter rounds.
- `VOCAB_MID` — 5 `{word, letter, gapIndex, path}` entries for middle-letter rounds.
- `DIGITS` — `['1','2','3','4','5','6','7','8','9','0']`.

## Contracts

Internal only; no network. New entries must satisfy the existing registries:

- `QUIZZES[key] = {title, rounds, build}` where `build()` returns
  `{prompt, target, bareTarget, options: [{html, ok}], optClass, reveal}` with exactly
  one `ok: true`.
- `ACTS[key] = {sym | icon, name, open}`.
- `AGE_ACTIVITIES[band]` must only list keys present in `ACTS`.

## UI / UX

- All new copy is Catalan and lowercase in the markup; the global uppercase toggle
  handles the rest.
- New icons are **filled monochrome silhouettes** on a `0 0 40 40` viewBox taking the
  colour passed to `shapeHTML`-style rendering, matching `SHAPES`. No strokes-only
  icons, no emoji, no colour of their own.
- «restar» reuses the existing quiz screen, states and feedback; dimmed dots use the
  existing `.opt.miss`-style opacity rather than a new token.
- Prompts only appear where `reads()` is true (HR-003).

## Non-functional

- The whole app must stay offline-capable: no new network requests, no new origins in
  the CSP. New icons are inline SVG in `index.html`.
- Bump `CACHE` in `sw.js` if any precached file changes.
- Hit targets stay at 44px or more.
- The added weight of ~27 inline SVG paths should keep `index.html` comfortably under
  100 KB.
- Icons take `currentColor` or the passed colour, so light and dark both work with no
  extra values.

## Acceptance criteria

- [ ] «primera lletra» offers at least one word for every Catalan letter that can begin
      a word, i.e. all of `BASE_LETTERS` except Ç, K, W and Y, plus LL.
- [ ] The letter A appears in «primera lletra».
- [ ] No round of «primera lletra» is built from `SHAPES` or `COLORS` names.
- [ ] Ç and NY are reachable in «primera lletra» through middle-letter rounds and never
      as an initial.
- [ ] Over 2000 generated rounds, every round has exactly one correct option and at
      least 4 options (existing test 2 covers this once `firstletter` is rebuilt).
- [ ] `xifres` appears in the 4-5 and 6-7 menus, traces `1 2 3 4 5 6 7 8 9 0` in that
      order, and hides the case toggle.
- [ ] `restar` appears only in the 6-7 menu and never produces a result below 1 over
      2000 generated rounds.
- [ ] Memory at 6-7 deals 6 pairs; at 4-5, 4 pairs; at 2-3, 2 pairs.
- [ ] `ordenar` appears in the 2-3 menu with 3 items.
- [ ] `.age-btn` is 14px, `.opt` and `.seq-card` are 12px.
- [ ] `node test.js` passes, including the existing "nothing to read before 6" check.
- [ ] Verified in both light and dark mode.

## Decisions taken

- K, W and Y excluded from «primera lletra» — HR-005.
- Ç and NY taught medially, never as initials — HR-006.
- «primera lletra» stays 6-7 only — HR-007.
- Digit tracing covers 0-9, never multi-digit numbers — HR-008.
- Subtraction never yields a result below 1 — HR-009.
- Middle-letter rounds are a mode inside «primera lletra», not a separate tile, and show
  the drawing plus the gapped word.
- Subtraction is its own tile, not a mode inside «sumar».
- The digit tile is named `xifres`, to avoid colliding with `comptar`.
- `helicòpter` carries H. It is the weakest entry — H is silent in Catalan and the word
  is long — but it is recognisable and unambiguous to draw. Swap it freely if a better
  one turns up.

## Issues

| # | Title | Blocked by |
|---|---|---|
| [#2](https://github.com/orioltomas/apren-en-calma/issues/2) | Give «primera lletra» its own drawn vocabulary | — |
| [#3](https://github.com/orioltomas/apren-en-calma/issues/3) | Add «xifres»: trace the digits 0-9 | — |
| [#4](https://github.com/orioltomas/apren-en-calma/issues/4) | Add «restar» for the 6-7 band | — |
| [#5](https://github.com/orioltomas/apren-en-calma/issues/5) | Calibrate memory pairs, «ordenar» at 2-3, and the remaining radii | — |
| [#6](https://github.com/orioltomas/apren-en-calma/issues/6) | Teach Ç and NY with middle-of-word rounds in «primera lletra» | #2 |

## Open questions

None.

## Out of scope / future

- Opening «primera lletra» to the 4-5 band with initial-only rounds. Considered and
  deliberately deferred (HR-007); the machinery would allow it later.
- A different game shape per band inside «primera lletra».
- Reducing the overlap at 6-7, where «formes», «patrons» and «què hi sobra» all draw on
  the same 8 shapes.
- Keeping the quantity mode of «gran i petit» at 6-7 as a basis for subtraction.
