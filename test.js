/* Proves d'Aprèn en Calma — sense dependències.
 *
 *   node test.js
 *
 * No hi ha cap còpia de la lògica aquí dins: es llegeix el <script> real
 * d'index.html i s'executa dins un DOM mínim simulat, així que les proves
 * no poden quedar desincronitzades del que s'envia al navegador.
 *
 * Surt amb codi 1 si alguna cosa falla.
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const FILE = path.join(__dirname, 'index.html')
const html = fs.readFileSync(FILE, 'utf8')
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1]
const markup = html.split('<script>')[0]

/* Els `const`/`let` de dalt de tot del script queden a l'àmbit lèxic i no
   arriben a l'objecte global, així que s'hi afegeix un epíleg que els exposa. */
const src = script + `
globalThis.__T = {
  QUIZZES, AGE_ACTIVITIES, ACTS, SHAPES, COLORS, ACCENT, DIM,
  maxNumber, letters, renderNum, newMemory, memoryConfig,
  successMsg, doneMsg, reads, againLabel,
  setAge: a => { currentAge = a },
  setCase: c => { letCase = c },
  cards: () => memCards
}`

/* ── DOM mínim ───────────────────────────────────────────────────────── */
function makeEl(id) {
  return {
    id, textContent: '', disabled: false, children: [], dataset: {},
    scrollTop: 0, width: 260, height: 200,
    style: new Proxy({}, { get: (t, k) => t[k] || '', set: (t, k, v) => (t[k] = v, true) }),
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)) },
      remove(...c) { c.forEach(x => this._s.delete(x)) },
      contains(c) { return this._s.has(c) },
      toggle(c, f) { f === undefined ? (this._s.has(c) ? this._s.delete(c) : this._s.add(c)) : (f ? this._s.add(c) : this._s.delete(c)) }
    },
    /* innerHTML materialitza fills perquè firstChild/lastChild funcionin
       igual que al navegador (ho fa setAge amb les caselles del menú) */
    get innerHTML() { return this._html || '' },
    set innerHTML(v) {
      this._html = v
      this.children = v.includes('act-sym') ? [makeEl('sym'), makeEl('name')] : []
    },
    get firstChild() { return this.children[0] },
    get lastChild() { return this.children[this.children.length - 1] },
    appendChild(c) { this.children.push(c); return c },
    addEventListener(t, fn) { (this._h = this._h || {})[t] = fn },
    setAttribute() {},
    getBoundingClientRect: () => ({ width: 260, height: 200 }),
    getContext: () => new Proxy({}, { get: () => () => {}, set: () => true })
  }
}

const els = {}
const ctx = {
  document: {
    getElementById: id => els[id] || (els[id] = makeEl(id)),
    createElement: () => makeEl('new'),
    querySelectorAll: () => [],
    addEventListener() {}
  },
  window: { addEventListener() {}, innerWidth: 390, innerHeight: 780 },
  navigator: { vibrate: () => {} },
  localStorage: { _d: {}, getItem(k) { return this._d[k] ?? null }, setItem(k, v) { this._d[k] = String(v) } },
  location: { protocol: 'file:' },
  setTimeout: () => 0,
  clearTimeout: () => {},
  console
}
ctx.globalThis = ctx
vm.createContext(ctx)
vm.runInContext(src, ctx)

const T = ctx.__T
const QZ = T.QUIZZES
const setAge = a => T.setAge(a)

/* ── utillatge ───────────────────────────────────────────────────────── */
let fails = 0
const group = t => console.log('\n== ' + t + ' ==')
const ok = m => console.log('  ✓ ' + m)
const check = (m, cond, extra) => {
  if (!cond) { fails++; console.log('  ✗ ' + m + (extra ? '  → ' + extra : '')) }
  return cond
}

/* ── 1. Coherència entre HTML, CSS i JS ──────────────────────────────── */
group('Cablejat: cap referència penjada')
{
  const idsHtml = new Set(markup.match(/id="([^"]+)"/g).map(s => s.slice(4, -1)))
  const idsJs = new Set([...script.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]))
  const screens = new Set([...script.matchAll(/showScreen\('([^']+)'\)/g)].map(m => 'screen-' + m[1]))
  const missing = [...idsJs].filter(i => !idsHtml.has(i))
  const noScreen = [...screens].filter(i => !idsHtml.has(i))
  check('tots els id que fa servir el JS existeixen a l\'HTML', !missing.length, missing.join(', '))
  check('totes les pantalles existeixen', !noScreen.length, noScreen.join(', '))

  const cssClasses = new Set([...style.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]))
  const jsClasses = new Set()
  for (const m of script.matchAll(/className='([^']*)'|class="([^"]*)"/g)) {
    (m[1] || m[2] || '').split(/\s+/).forEach(c => c && jsClasses.add(c))
  }
  for (const m of script.matchAll(/classList\.(?:add|toggle)\('([^']+)'/g)) jsClasses.add(m[1])
  const noStyle = [...jsClasses].filter(c => !cssClasses.has(c))
  check('totes les classes que aplica el JS tenen estil', !noStyle.length, noStyle.join(', '))

  const acts = new Set(Object.keys(T.ACTS))
  const listed = new Set(Object.values(T.AGE_ACTIVITIES).flat())
  check('cap activitat del menú sense definir', ![...listed].filter(a => !acts.has(a)).length)
  check('cap activitat definida i mai oferta', ![...acts].filter(a => !listed.has(a)).length)
  if (!fails) ok(`${idsJs.size} id, ${jsClasses.size} classes i ${acts.size} activitats, tot lligat`)
}

/* ── 2. Cada ronda té una única resposta correcta ────────────────────── */
group('Rondes: exactament una resposta correcta')
for (const age of [2, 4, 6]) {
  setAge(age)
  for (const key of Object.keys(QZ)) {
    if (!T.AGE_ACTIVITIES[age].includes(key)) continue   // no disponible en aquest tram
    let bad = 0, thin = 0
    for (let i = 0; i < 2000; i++) {
      const r = QZ[key].build()
      if (r.options.filter(o => o.ok).length !== 1) bad++
      if (r.options.length < 2) thin++
    }
    const a = check(`${age} anys · ${key}: 1 correcta per ronda`, bad === 0, bad + ' rondes dolentes')
    const b = check(`${age} anys · ${key}: prou opcions`, thin === 0)
    if (a && b) ok(`${age} anys · ${key} (2000 rondes)`)
  }
}

/* ── 3. Patrons ──────────────────────────────────────────────────────── */
group('Patrons: base no degenerada i opcions barrejades')
for (const age of [4, 6]) {
  setAge(age)
  const orders = new Set()
  let flat = 0
  for (let i = 0; i < 2000; i++) {
    const r = QZ.patterns.build()
    /* la forma es distingeix pel contingut de l'svg, no per la capçalera */
    const shapes = (r.target.match(/<svg[\s\S]*?<\/svg>/g) || []).map(s => s.replace(/^<svg[^>]*>/, ''))
    if (new Set(shapes).size < 2) flat++
    orders.add(r.options.map(o => o.html).join('|'))
  }
  const a = check(`${age} anys: cap patró d'un sol element`, flat === 0, flat + ' plans')
  const b = check(`${age} anys: l'ordre de les opcions varia`, orders.size > 1, orders.size + ' ordres')
  if (a && b) ok(`${age} anys: patrons vàlids, ${orders.size} ordres d'opcions`)
}

/* ── 4. Comptar ──────────────────────────────────────────────────────── */
group('Comptar: paraules i límits per tram')
for (const [age, max] of [[2, 5], [4, 10], [6, 20]]) {
  setAge(age)
  check(`${age} anys: arriba fins a ${max}`, T.maxNumber() === max, 'és ' + T.maxNumber())
  const words = []
  for (let i = 0; i < max; i++) { T.renderNum(i); words.push(els['num-word'].textContent) }
  if (check(`${age} anys: cap paraula repetida`, new Set(words).size === max, words.join(',')))
    ok(`${age} anys: 1..${max} → ${words[0]} … ${words[max - 1]}`)
}

/* ── 5. Alfabet català ───────────────────────────────────────────────── */
group('Lletres: alfabet català per tram')
for (const [age, n] of [[4, 27], [6, 29]]) {
  setAge(age); T.setCase('maj')
  const ls = T.letters()
  check(`${age} anys: ${n} lletres`, ls.length === n, 'són ' + ls.length)
  check(`${age} anys: inclou Ç`, ls.includes('Ç'))
  if (age === 6) check('6-7 anys: inclou els dígrafs LL i NY', ls.includes('LL') && ls.includes('NY'))
  ok(`${age} anys: ${ls.length} lletres, ${ls.slice(0, 5).join(' ')} …`)
}
setAge(6); T.setCase('min')
if (check('minúscules ben derivades', T.letters().includes('ç') && T.letters().includes('ny')))
  ok('minúscules: ' + T.letters().slice(0, 5).join(' ') + ' …')
T.setCase('maj')

/* ── 6. Memòria ──────────────────────────────────────────────────────── */
group('Memòria: parelles úniques')
const EXPECTED_PAIRS = { 2: 2, 4: 4, 6: 6 }
for (const age of [2, 4, 6]) {
  setAge(age)
  const cfg = T.memoryConfig()
  check(`${age} anys: ${EXPECTED_PAIRS[age]} parelles`, cfg.pairs === EXPECTED_PAIRS[age], 'són ' + cfg.pairs)
  T.newMemory()
  const counts = {}
  T.cards().forEach(id => counts[id] = (counts[id] || 0) + 1)
  const a = check(`${age} anys: ${cfg.pairs} parelles de 2 cartes`,
    Object.keys(counts).length === cfg.pairs && Object.values(counts).every(v => v === 2))
  const b = check(`${age} anys: total de cartes correcte`, T.cards().length === cfg.pairs * 2)
  if (a && b) ok(`${age} anys: ${cfg.pairs} parelles en ${cfg.cols} columnes`)
}

/* ── 7. Sumar ────────────────────────────────────────────────────────── */
group('Sumar: el total quadra amb els punts dibuixats')
setAge(6)
{
  let bad = 0
  for (let i = 0; i < 3000; i++) {
    const r = QZ.sums.build()
    const dots = (r.target.match(/<i/g) || []).length
    if (Number(r.options.find(o => o.ok).html) !== dots) bad++
    if (new Set(r.options.map(o => o.html)).size !== r.options.length) bad++
  }
  if (check('suma correcta i opcions sense repetits', bad === 0, bad + ' errors'))
    ok('3000 sumes: total = punts dibuixats, 4 opcions diferents')
}

/* ── 8. Primera lletra ───────────────────────────────────────────────── */
group('Primera lletra: la inicial correspon a la paraula')
{
  let bad = 0
  for (let i = 0; i < 2000; i++) {
    const r = QZ.firstletter.build()
    if (r.options.find(o => o.ok).html !== r.reveal.charAt(0).toUpperCase()) bad++
  }
  if (check('inicial correcta', bad === 0, bad + ' errors')) ok('2000 rondes correctes')
}

/* ── 9. Res a llegir abans dels 6 anys ───────────────────────────────── */
group('Res a llegir abans dels 6 anys')
const VERBS = /toca|continua|quin|quants|quina|troba|comença|encaixa/i
for (const age of [2, 4]) {
  setAge(age)
  const textual = []
  for (const key of T.AGE_ACTIVITIES[age]) {
    if (!QZ[key]) continue
    for (let i = 0; i < 500; i++) {
      const p = QZ[key].build().prompt
      if (p && VERBS.test(p)) { textual.push(`${key}: "${p}"`); break }
    }
  }
  if (check(`${age} anys: cap consigna escrita`, !textual.length, textual.join(' / ')))
    ok(`${age} anys: cap activitat demana llegir una instrucció`)
}
setAge(6)
{
  const prompts = ['patterns', 'odd', 'sums', 'firstletter'].map(k => QZ[k].build().prompt)
  if (check('6-7 anys: hi tornen a sortir les consignes', prompts.every(p => p && VERBS.test(p)), prompts.join(' / ')))
    ok('6-7 anys: ' + prompts.join(' · '))
}

group('Reforç no verbal per a qui no llegeix')
for (const age of [2, 4]) {
  setAge(age)
  const a = check(`${age} anys: elogi sense paraules`, !/[a-zA-Z]/.test(T.successMsg()), T.successMsg())
  const b = check(`${age} anys: final sense paraules`, !/[a-zA-Z]/.test(T.doneMsg()), T.doneMsg())
  const c = check(`${age} anys: botó de repetir sense paraules`, !/[a-zA-Z]/.test(T.againLabel()), T.againLabel())
  if (a && b && c) ok(`${age} anys: encert "${T.successMsg()}", final "${T.doneMsg()}", repetir "${T.againLabel()}"`)
}
setAge(6)
if (check('6-7 anys: torna el text', T.successMsg() === 'Molt bé' && T.doneMsg() === 'Ja està'))
  ok(`6-7 anys: encert "${T.successMsg()}", final "${T.doneMsg()}"`)

group('Gran i petit: consigna sempre dibuixada')
for (const age of [2, 4]) {
  setAge(age)
  let bad = 0
  for (let i = 0; i < 1000; i++) {
    const t = QZ.compare.build().target || ''
    /* la referència ha de portar un element encès i un d'apagat */
    if (!t.includes('class="cue"') || !t.includes(T.ACCENT) || !t.includes(T.DIM)) bad++
  }
  if (check(`${age} anys: pista visual a cada ronda`, bad === 0, bad + ' rondes sense pista'))
    ok(`${age} anys: 1000 rondes amb referència encesa/apagada`)
}

console.log(fails === 0 ? '\n✅ Totes les proves passen\n' : `\n❌ ${fails} proves fallades\n`)
process.exit(fails ? 1 : 0)
