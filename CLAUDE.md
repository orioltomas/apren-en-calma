# Aprèn en Calma

Calm learning games in Catalan for children aged 2-7. Static offline PWA, no build step:
`index.html` holds all markup, styles and logic; `sw.js` precaches the shell; `test.js`
runs the real script from `index.html` inside a minimal fake DOM.

```bash
node test.js          # the whole test suite, no dependencies
python3 -m http.server 8000   # serve it — the service worker needs http, not file://
```

## Before you change anything

Read, in this order:

1. **`.agents/hard-rules.md`** — binding product decisions. If your work contradicts one,
   stop and surface the conflict; do not silently proceed.
2. **`.agents/reference.md`** — domain vocabulary (age bands, `reads()`, drawn cue,
   hint halo, taught glyph).
3. **`.agents/specs/`** — specs that are pending or in progress.

## What matters here

- **No audio, no scores, no timers, no rewards.** The product is calm by design.
- **`reads()` gates all written language.** Before age 6 there are no written
  instructions, praise or labels — a drawn cue, a `✓` and the hint halo instead.
  The activity menu is the one deliberate exception.
- **Colours live in tokens**, never as literals in rules. The light palette is on
  `:root`, the dark one on `:root[data-theme="dark"]`, and no value is repeated. The
  colours the app *teaches* are content and stay identical in both modes.
- **Taught glyphs are set in Andika, interface text in Quicksand.** Andika distinguishes
  lowercase `l` from uppercase `I`; Quicksand does not, and the app has a case toggle.
- **Canvas cannot read CSS variables.** The trace stroke, the guide glyph and the eraser
  resolve tokens at runtime or avoid colour entirely.
- **Fonts are served from `fonts/`, never from a CDN.** The service worker ignores
  cross-origin requests, so external fonts would never be cached and the letters would
  fall back offline.
- **Hit targets never go below 44px**, including inside the responsive media queries.

## Workflow

`/grilling` to define a feature, `/spec-to-issues` to split a ready spec into issues,
`/implement` to work through them.
