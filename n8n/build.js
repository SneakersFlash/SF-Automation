#!/usr/bin/env node
// Ngerakit workflow JSON n8n dari template + source Code node.
//
// Kenapa ada: Code node di n8n disimpen sebagai SATU string JSON dengan \n kepite,
// jadi kalau workflow JSON-nya langsung yang di-commit, dia gak bisa di-diff dan gak
// bisa di-review. Di sini JS-nya hidup sebagai file .js beneran, build.js yang nempelin.
//
// Pakai:
//   node n8n/build.js            # rakit semua template -> workflows/
//   node n8n/build.js 03         # rakit template yang namanya ngandung "03" doang
//
// Placeholder yang dikenal di dalam template:
//   {{CODE:local.buildSearch}}   -> isi exports.buildSearch dari src/local.nodes.js
//   {{CODE:finder.aggregateLinks}}
//   {{CODE:main.buildKeyword}}
// dan di dalam source JS-nya sendiri:
//   {{LIB}}                      -> isi exports.deriveVariants dari src/lib.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const TEMPLATES = path.join(ROOT, 'templates');
const OUT = path.join(ROOT, 'workflows');

const lib = require(path.join(SRC, 'lib.js'));

// Namespace -> file. Nambah workflow baru? daftarin di sini.
const NS = {
  local: require(path.join(SRC, 'local.nodes.js')),
  main: require(path.join(SRC, 'main.nodes.js')),
  finder: require(path.join(SRC, 'finder.nodes.js')),
};

// {{LIB}} diganti isi lib.js. split/join, bukan String.replace, karena kode lib
// ngandung "$&" (di regex escape) yang bakal ditafsirin sebagai pola pengganti.
function resolveCode(ref) {
  const dot = ref.indexOf('.');
  if (dot === -1) throw new Error(`Ref "${ref}" harus bentuk <namespace>.<export>`);
  const ns = ref.slice(0, dot);
  const name = ref.slice(dot + 1);

  if (!NS[ns]) throw new Error(`Namespace "${ns}" gak dikenal (ada: ${Object.keys(NS).join(', ')})`);
  const code = NS[ns][name];
  if (typeof code !== 'string') {
    throw new Error(`src/${ns}.nodes.js gak punya export "${name}" (ada: ${Object.keys(NS[ns]).join(', ')})`);
  }

  return code
    .split('{{LIB}}').join(lib.deriveVariants)
    .split('{{BRANDS}}').join(lib.brandSites);
}

function build(file) {
  const raw = fs.readFileSync(path.join(TEMPLATES, file), 'utf8');

  // Template itu JSON valid, jadi placeholder-nya duduk sebagai string value.
  // Substitusi dikerjain di level objek (bukan string-replace ke teks JSON) supaya
  // kode yang ngandung kutip/backslash ke-escape bener sama JSON.stringify.
  const wf = JSON.parse(raw);

  let injected = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (typeof v === 'string') {
        const m = v.match(/^\{\{CODE:([A-Za-z0-9_]+\.[A-Za-z0-9_]+)\}\}$/);
        if (m) { node[k] = resolveCode(m[1]); injected++; }
        else if (v.indexOf('{{CODE:') !== -1) {
          throw new Error(`Placeholder di "${k}" harus berdiri sendiri satu string penuh, dapetnya: ${v.slice(0, 60)}...`);
        }
      } else walk(v);
    }
  };
  walk(wf);

  // Jaring pengaman: {{LIB}} nyasar berarti ada source yang lupa dirakit.
  const outText = JSON.stringify(wf, null, 2);
  if (outText.indexOf('{{LIB}}') !== -1) throw new Error(`${file}: masih ada {{LIB}} yang belum kesubstitusi`);

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, file), outText + '\n');

  const nodes = Array.isArray(wf.nodes) ? wf.nodes.length : 0;
  console.log(`  ${file}  ->  workflows/${file}  (${nodes} node, ${injected} code node diinject)`);
}

function main() {
  const filter = process.argv[2] || '';

  if (!fs.existsSync(TEMPLATES)) {
    console.error(`Folder templates/ gak ada di ${TEMPLATES}`);
    process.exit(1);
  }

  const files = fs.readdirSync(TEMPLATES)
    .filter(f => f.endsWith('.json'))
    .filter(f => !filter || f.indexOf(filter) !== -1)
    .sort();

  if (!files.length) {
    console.error(filter ? `Gak ada template yang cocok "${filter}"` : 'Gak ada template .json di templates/');
    process.exit(1);
  }

  console.log('Rakit workflow n8n:');
  let fail = 0;
  for (const f of files) {
    try { build(f); }
    catch (e) { fail++; console.error(`  ${f}  ->  GAGAL: ${e.message}`); }
  }

  if (fail) { console.error(`\n${fail} template gagal dirakit.`); process.exit(1); }
  console.log('\nSelesai. Import file di workflows/ ke n8n (Workflows -> ... -> Import from File).');
}

main();
