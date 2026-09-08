# Hard rules

Binding business decisions for *Aprèn en Calma*. Agents must not contradict these.
If new work conflicts with a rule, stop and surface the conflict — do not silently proceed.

| id | rule | why | decided |
|---|---|---|---|
| HR-001 | The app has no audio of any kind: no speech synthesis, no sound effects. The only non-visual feedback is `haptics()` (`navigator.vibrate`). | Catalan voice availability in `speechSynthesis` varies by device; on iOS it falls back to another language and reads Catalan vocabulary with a foreign accent. Audio would also break the calm the app is named after. | 2026-07-26 |
| HR-002 | Activity names in the menu are always shown as text, including for age bands that cannot read yet. The menu is the deliberate exception to the `reads()` rule. | Several tile symbols do not stand on their own without the name, and the menu is also used by the adult handing over the tablet. | 2026-07-26 |
| HR-003 | Before age 6 the app shows no written instructions, praise or labels. Feedback is a sign (`✓`), the instruction is a drawn cue (`cueHTML`) and the demonstration is the slow hint halo (`armHint`). Gated by `reads()`. | Children under 6 do not read yet. | pre-existing |
| HR-004 | There are no scores, no rewards, no timers and no failure states. A wrong answer dims and the round continues. | The product is explicitly calm and non-competitive: "sense sons, sense premis, sense presses". | pre-existing |
| HR-005 | «primera lletra» (first-letter game) covers only letters that can begin a Catalan word. K, W and Y are excluded from it because only loanwords begin with them. They remain in the «lletres» tracing activity, which teaches the full alphabet. | Teaching a child that "K is for kiwi" in Catalan teaches a grapheme the language does not use natively. | 2026-09-08 |
| HR-006 | Ç and NY are never taught as initial letters, because no Catalan word begins with them. They are taught through middle-of-word rounds inside «primera lletra». | Orthographic fact of Catalan: ç and ny only occur medially or finally. | 2026-09-08 |
| HR-007 | «primera lletra» is offered only in the 6-7 age band. | Its middle-of-word rounds require reading the written word, and the band split keeps the activity coherent rather than splitting it into two different games. | 2026-09-08 |
| HR-008 | The tracing activity for digits covers the ten digits 0-9, never multi-digit numbers. | Tracing "17" is a different motor task (two glyphs plus spacing) from forming a single digit. | 2026-09-08 |
| HR-009 | Subtraction never produces a result below 1. No zero, no negative results. | The result is shown as a group of dots; an empty group is not a readable answer for a 6-7 year old. | 2026-09-08 |
| HR-010 | Colours the app teaches (`COLORS`, `DRAW_COLORS`) are content, not theme tokens. They stay identical in light and dark mode. | They are the red and blue the child is learning to name; a theme must not change what red looks like. | 2026-09-08 |
