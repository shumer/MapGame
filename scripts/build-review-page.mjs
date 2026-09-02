// Generates a standalone review page: every country's names, capitals and facts
// side by side in all three languages, for proofreading before the game is built.
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] ?? 'review.html'
const data = JSON.parse(fs.readFileSync('src/data/countries.json', 'utf8'))
const derived = JSON.parse(fs.readFileSync('src/data/derived.json', 'utf8'))

const flag = (iso) => {
  const svg = fs.readFileSync(`node_modules/flag-icons/flags/4x3/${iso.toLowerCase()}.svg`)
  return `data:image/svg+xml;base64,${svg.toString('base64')}`
}

const SUBREGIONS = {
  west: 'Западная Европа',
  central: 'Центральная Европа',
  east: 'Восточная Европа',
  nordic: 'Северная Европа',
  baltic: 'Прибалтика',
  balkans: 'Балканы',
  south: 'Южная Европа',
}

const rows = data.countries.map((c) => ({
  ...c,
  flag: flag(c.iso),
  near: derived[c.iso].near,
  borders: derived[c.iso].borders,
  focus: derived[c.iso].focus,
}))

const counts = {
  total: rows.length,
  fame: [1, 2, 3].map((n) => rows.filter((r) => r.fame === n).length),
  micro: rows.filter((r) => r.micro).length,
  subregions: Object.keys(SUBREGIONS).length,
}

const html = `<title>Европа на трёх языках</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root {
  --ground: #e8edee;
  --surface: #ffffff;
  --surface-2: #f3f6f6;
  --line: #d3dcdd;
  --ink: #16211f;
  --muted: #5d6c6e;
  --faint: #8d9a9b;
  --accent: #0e6b63;
  --accent-soft: #d7e8e5;
  --warn: #a86a12;
  --warn-soft: #f5e7cf;
  --shadow: 0 1px 2px rgba(22, 33, 31, .06), 0 8px 20px -14px rgba(22, 33, 31, .35);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ground: #0f1518;
    --surface: #182024;
    --surface-2: #1e282c;
    --line: #2c383d;
    --ink: #e4ecea;
    --muted: #9aa9ab;
    --faint: #6d7c7e;
    --accent: #5cc3b3;
    --accent-soft: #17332f;
    --warn: #d6a251;
    --warn-soft: #33291a;
    --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px -16px rgba(0, 0, 0, .8);
  }
}
:root[data-theme="dark"] {
  --ground: #0f1518;
  --surface: #182024;
  --surface-2: #1e282c;
  --line: #2c383d;
  --ink: #e4ecea;
  --muted: #9aa9ab;
  --faint: #6d7c7e;
  --accent: #5cc3b3;
  --accent-soft: #17332f;
  --warn: #d6a251;
  --warn-soft: #33291a;
  --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px -16px rgba(0, 0, 0, .8);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font-family: "Public Sans", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}
.wrap { max-width: 1120px; margin: 0 auto; padding: 40px 24px 80px; }

header { display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; }
h1 {
  font-family: Newsreader, Georgia, serif;
  font-weight: 600;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.1;
  margin: 0 0 6px;
  text-wrap: balance;
}
.sub { color: var(--muted); margin: 0; max-width: 52ch; }

.metrics { display: flex; gap: 26px; flex-wrap: wrap; }
.metric { display: flex; flex-direction: column; gap: 2px; }
.metric b { font-family: "IBM Plex Mono", monospace; font-size: 24px; font-weight: 500; font-variant-numeric: tabular-nums; }
.metric span { font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: var(--faint); }

.controls {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  position: sticky; top: 0; z-index: 5;
  padding: 12px 0; margin-bottom: 16px;
  background: linear-gradient(var(--ground) 78%, transparent);
}
.seg { display: flex; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 3px; gap: 2px; }
.seg button {
  font: inherit; font-size: 13px; color: var(--muted);
  border: 0; background: transparent; border-radius: 999px;
  padding: 6px 14px; cursor: pointer;
}
.seg button[aria-pressed="true"] { background: var(--accent); color: var(--surface); }
input[type="search"] {
  font: inherit; color: var(--ink);
  background: var(--surface); border: 1px solid var(--line); border-radius: 999px;
  padding: 8px 16px; min-width: 200px; flex: 1;
}
input[type="search"]::placeholder { color: var(--faint); }
button:focus-visible, input:focus-visible, summary:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}

.group-title {
  font-family: Newsreader, Georgia, serif; font-size: 19px; font-weight: 600;
  margin: 30px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between; align-items: baseline;
}
.group-title em { font-family: "IBM Plex Mono", monospace; font-style: normal; font-size: 12px; color: var(--faint); }

.list { display: flex; flex-direction: column; gap: 8px; }
.card {
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
  box-shadow: var(--shadow); overflow: hidden;
}
.card > summary {
  display: grid; gap: 16px; align-items: center; cursor: pointer; list-style: none;
  grid-template-columns: 46px 58px minmax(0, 1fr) auto;
  padding: 12px 16px;
}
.card > summary::-webkit-details-marker { display: none; }
.card[open] { border-color: var(--accent); }

.flag { width: 46px; height: 34px; border-radius: 4px; border: 1px solid var(--line); object-fit: cover; display: block; }
.codes { font-family: "IBM Plex Mono", monospace; font-size: 12px; color: var(--faint); line-height: 1.35; }
.codes b { display: block; font-size: 15px; font-weight: 500; color: var(--ink); letter-spacing: .04em; }

.langs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.lang { min-width: 0; }
.lang .tag { font-size: 10px; letter-spacing: .11em; text-transform: uppercase; color: var(--faint); }
.lang .country { font-weight: 600; overflow-wrap: anywhere; }
.lang .capital { color: var(--muted); font-size: 14px; overflow-wrap: anywhere; }

.marks { display: flex; gap: 6px; align-items: center; }
.pill {
  font-size: 11px; letter-spacing: .05em; padding: 3px 9px; border-radius: 999px;
  background: var(--surface-2); color: var(--muted); white-space: nowrap;
}
.pill.fame1 { background: var(--accent-soft); color: var(--accent); }
.pill.micro { background: var(--warn-soft); color: var(--warn); }

.detail { border-top: 1px solid var(--line); background: var(--surface-2); padding: 14px 16px 16px; display: grid; gap: 12px; }
.facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.fact .tag { font-size: 10px; letter-spacing: .11em; text-transform: uppercase; color: var(--faint); }
.fact p { margin: 2px 0 0; font-size: 14px; line-height: 1.45; }
.meta { display: flex; flex-wrap: wrap; gap: 18px; font-family: "IBM Plex Mono", monospace; font-size: 12px; color: var(--muted); }
.meta span b { color: var(--faint); font-weight: 400; }

.empty { padding: 40px; text-align: center; color: var(--faint); }

@media (max-width: 860px) {
  .card > summary { grid-template-columns: 40px 1fr; grid-template-areas: "flag codes" "langs langs" "marks marks"; }
  .flag { grid-area: flag; } .codes { grid-area: codes; } .langs { grid-area: langs; } .marks { grid-area: marks; }
  .langs, .facts { grid-template-columns: 1fr; gap: 8px; }
}
</style>

<div class="wrap">
  <header>
    <div>
      <h1>Европа на трёх языках</h1>
      <p class="sub">Данные для игры: названия стран, столицы и факты на русском, польском и английском. Всё, что здесь неверно, правится в <code>src/data/countries.json</code>.</p>
    </div>
    <div class="metrics">
      <div class="metric"><b>${counts.total}</b><span>стран</span></div>
      <div class="metric"><b>${counts.fame[0]}</b><span>известных</span></div>
      <div class="metric"><b>${counts.fame[1]}</b><span>средних</span></div>
      <div class="metric"><b>${counts.fame[2]}</b><span>редких</span></div>
      <div class="metric"><b>${counts.micro}</b><span>крошечных</span></div>
    </div>
  </header>

  <div class="controls">
    <div class="seg" role="group" aria-label="Порядок">
      <button data-sort="region" aria-pressed="true">По регионам</button>
      <button data-sort="alpha" aria-pressed="false">По алфавиту</button>
      <button data-sort="fame" aria-pressed="false">По известности</button>
    </div>
    <input type="search" id="q" placeholder="Найти страну или столицу на любом языке" aria-label="Поиск">
    <button class="seg" id="toggle-all" style="padding:6px 14px;cursor:pointer;font:inherit;font-size:13px;color:var(--muted)">Раскрыть все</button>
  </div>

  <div id="out"></div>
</div>

<script>
const DATA = ${JSON.stringify(rows)};
const SUBREGIONS = ${JSON.stringify(SUBREGIONS)};
const FAME_LABEL = { 1: 'известная', 2: 'средняя', 3: 'редкая' };
const out = document.getElementById('out');
let sort = 'region';
let query = '';

const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);

function matches(c) {
  if (!query) return true;
  const hay = [c.iso, c.un, ...Object.values(c.name), ...Object.values(c.capital)].join(' ').toLowerCase();
  return hay.includes(query);
}

function card(c) {
  const langs = ['ru', 'pl', 'en'].map((l) => \`
    <div class="lang">
      <div class="tag">\${l}</div>
      <div class="country">\${esc(c.name[l])}</div>
      <div class="capital">\${esc(c.capital[l])}</div>
    </div>\`).join('');
  const facts = ['ru', 'pl', 'en'].map((l) => \`
    <div class="fact"><div class="tag">\${l}</div><p>\${esc(c.fact[l])}</p></div>\`).join('');
  return \`
  <details class="card" data-iso="\${c.iso}">
    <summary>
      <img class="flag" src="\${c.flag}" alt="Флаг: \${esc(c.name.ru)}">
      <div class="codes"><b>\${c.iso}</b>\${c.un}</div>
      <div class="langs">\${langs}</div>
      <div class="marks">
        <span class="pill fame\${c.fame}">\${FAME_LABEL[c.fame]}</span>
        \${c.micro ? '<span class="pill micro">маркер</span>' : ''}
      </div>
    </summary>
    <div class="detail">
      <div class="facts">\${facts}</div>
      <div class="meta">
        <span><b>столица</b> \${c.capitalCoords[0].toFixed(3)}, \${c.capitalCoords[1].toFixed(3)}</span>
        <span><b>рамка</b> \${c.focus.join(', ')}</span>
        <span><b>соседи</b> \${c.borders.join(', ') || 'нет сухопутных'}</span>
        <span><b>похожие ответы</b> \${c.near.join(', ')}</span>
      </div>
    </div>
  </details>\`;
}

function render() {
  const list = DATA.filter(matches);
  if (!list.length) { out.innerHTML = '<p class="empty">Ничего не нашлось.</p>'; return; }

  if (sort === 'alpha') {
    const sorted = [...list].sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'));
    out.innerHTML = '<div class="list">' + sorted.map(card).join('') + '</div>';
    return;
  }
  if (sort === 'fame') {
    out.innerHTML = [1, 2, 3].map((f) => {
      const g = list.filter((c) => c.fame === f).sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'));
      if (!g.length) return '';
      const title = { 1: 'Известные', 2: 'Средние', 3: 'Редкие' }[f];
      return \`<div class="group-title">\${title}<em>\${g.length}</em></div><div class="list">\${g.map(card).join('')}</div>\`;
    }).join('');
    return;
  }
  out.innerHTML = Object.entries(SUBREGIONS).map(([key, title]) => {
    const g = list.filter((c) => c.subregion === key).sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'));
    if (!g.length) return '';
    return \`<div class="group-title">\${title}<em>\${g.length}</em></div><div class="list">\${g.map(card).join('')}</div>\`;
  }).join('');
}

document.querySelectorAll('[data-sort]').forEach((b) => {
  b.addEventListener('click', () => {
    sort = b.dataset.sort;
    document.querySelectorAll('[data-sort]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    render();
  });
});
document.getElementById('q').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render(); });
document.getElementById('toggle-all').addEventListener('click', (e) => {
  const open = e.target.textContent === 'Раскрыть все';
  document.querySelectorAll('details.card').forEach((d) => { d.open = open; });
  e.target.textContent = open ? 'Свернуть все' : 'Раскрыть все';
});

render();
</script>
`

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, html)
console.log(`${OUT}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`)
