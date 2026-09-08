# Reference

Vocabulary and domain definitions for *Aprèn en Calma*.

## Age bands (trams)

The app has three bands, chosen on the entry screen and held in `currentAge`:
**2-3** (`2`), **4-5** (`4`) and **6-7** (`6`). Every activity scales its difficulty
from this single value; there is no per-activity difficulty setting.
`AGE_ACTIVITIES` decides which activities each band is offered.

## `reads()`

`currentAge >= 6`. The single gate for written language. When false the app shows no
written instruction, praise or label: the instruction becomes a drawn cue (`cueHTML`),
praise becomes `✓`, and the first round demonstrates itself with the hint halo.
The activity menu is the deliberate exception (see HR-002).

## Drawn cue (`cueHTML`)

A small drawing that replaces a written instruction for children who cannot read.
It shows what is being asked by example: the thing being asked for is drawn in the
accent colour and its opposite dimmed (e.g. a small dimmed circle beside a large
accent circle means "the big one").

## Hint halo (`armHint`)

A slow, non-punishing pulse on the correct answer. On the first round of a band that
cannot read it appears quickly — it is the demonstration that replaces an adult's
explanation. Otherwise it only appears after the child has been stuck a while.

## Taught glyph

Any character the app is teaching rather than using as interface: the large letter on
«lletres», the large digit on «xifres», the numeral on «comptar», the `1 2 3` / `A B C`
tile symbols and the text options of letter and number questions. Taught glyphs are set
in Andika and are excluded from the global uppercase transform.

## Initial-letter round vs middle-letter round

Two round types inside «primera lletra». An **initial-letter round** shows a drawing and
asks which letter the word starts with. A **middle-letter round** shows the drawing plus
the written word with one letter replaced by a gap (`munta_a`) and asks for the missing
letter; it exists to teach Ç and NY, which cannot begin a Catalan word (HR-006).
