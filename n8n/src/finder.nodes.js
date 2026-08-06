// Source Code node buat workflow Article Image Finder (03-article-image-finder.json).
//
// Beda sama 02-local-crawl.json:
// 1. Berdiri sendiri, bukan subworkflow yang dipanggil MAIN.
// 2. Berhenti di link — TIDAK ada step kie.ai. Creative ngedit gambarnya sendiri.
// 3. TIDAK pakai deriveVariants(). Sheet sumbernya udah punya kolom ARTIKEL yang
//    bersih (11C056400, 208188001), jadi gak ada yang perlu diturunin dari SKU.
//    Nurunin ulang cuma nambah jalan buat salah.
//
// Node Rank Candidates / Check Already Found / Candidate Verify TIDAK diduplikat —
// build.js narik langsung dari src/local.nodes.js. Duplikasi persis itu yang dulu
// bikin MAIN dan Local Crawl drift.
//
// Kolom sheet (persis, spasi & huruf besar berpengaruh):
//   baca : BRAND | ARTIKEL | SKU NAME | KETERANGAN | Link Recommendation 1
//   tulis: Link Recommendation 1 | Link Recommendation 2

// Baris mana yang diproses. Tiap scrape spider itu bayar, jadi guard-nya ketat.
exports.filterPending = `
const out = [];
for (const it of $input.all()) {
  const r = it.json || {};

  const brand = String(r['BRAND'] || '').trim();
  const article = String(r['ARTIKEL'] || '').trim().toUpperCase();
  const model = String(r['SKU NAME'] || '').trim();
  const link1 = String(r['Link Recommendation 1'] || '').trim();
  const ket = String(r['KETERANGAN'] || '').trim().toUpperCase();
  const generic = String(r['GENERIC'] || '').trim();

  // Udah ada linknya (atau udah ditandai NOT FOUND run sebelumnya) -> lewat.
  // Mau dicari ulang? kosongin selnya di sheet.
  if (link1) continue;

  // Asetnya udah ada di Drive, gak usah dicariin.
  if (ket.indexOf('GDRIVE') !== -1) continue;

  // Tanpa artikel DAN tanpa nama, gak ada yang bisa dicari.
  if (!article && !model) continue;

  out.push({ json: { row_number: r.row_number, brand, article, model, generic } });
}
return out;
`;

// Bangun query. Nyontek cara manusia nge-Google: kode artikel duluan, baru nama.
exports.buildSearchArtikel = `

const o = $input.first().json;
const brand = String(o.brand || '').trim();
const article = String(o.article || '').trim().toUpperCase();
const rawModel = String(o.model || '').trim();

// Bersihin nama: buang kode artikel di ekor ("... - 11C056400"), filler Indonesia,
// dan nama brand yang dobel. Sisanya baru kepake sebagai keyword cadangan.
let model = rawModel.replace(/[-\\u2013]\\s*[A-Z]{0,3}\\d[\\dA-Z.\\- ]{3,}\\s*$/i, '').trim();
const FILLER = /\\b(sepatu|sandal|lari|running|jalan|wanita|women|womens|pria|men|mens|unisex|anak|kids|original|terbaru|new|size|ukuran|no|nomor|casual|sneakers|sneaker)\\b/gi;
model = model.replace(FILLER, ' ').replace(/\\s{2,}/g, ' ').trim();
if (brand) {
  const br = new RegExp('\\\\b' + brand.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\b', 'gi');
  model = model.replace(br, ' ').replace(/\\s{2,}/g, ' ').trim();
}
if (!model) model = rawModel;


// Artikel sering ditulis "model + kode warna" nempel jadi satu: 150802NAT.
// Situs brand nulisnya KEPISAH — Skechers: 150802_NAT. Mesin cari nganggep
// "150802NAT" satu token dan cuma mulangin halaman model yang paling populer
// (150802_BBK), bukan warna yang dicari. Jadi bentuk terpisahnya ikut dicariin.
// Pencocokannya sendiri gak perlu diapa-apain: normSku buang underscore/spasi,
// jadi "150802_NAT" di halaman tetap kena sama varian "150802NAT".
let artSplit = '';
const am = article.match(/^(\\d{4,8})([A-Z]{2,6})$/);
if (am) artSplit = am[1] + ' ' + am[2];

// Kolom GENERIC itu kode internal (prefix brand + artikel) — buat query GAK boleh
// dipakai mentah, "SKE150802NAT" gak dikenal situs manapun. TAPI di 19 dari 316
// baris dia nyimpen DASH yang hilang di ARTIKEL: PUMA 19551516 -> 195515-16,
// CROCS 100015CI -> 10001-5CI. Titik pisah itu yang dipakai situs brand, dan buat
// PUMA (angka semua) tebakan regex di atas gak bisa nemuin sendiri.
// Prefix brand-nya dikupas 0-4 huruf, dan cuma diterima kalau sisanya (dash dibuang)
// PERSIS sama dengan ARTIKEL — biar kode internal gak nyelinap jadi query.
let artDash = '';
const gen = String(o.generic || '').trim().toUpperCase();
if (article && gen.indexOf('-') !== -1) {
  for (let p = 0; p <= 4; p++) {
    const tail = gen.slice(p);
    if (tail.indexOf('-') !== -1 && tail.replace(/-/g, '') === article) { artDash = tail; break; }
  }
}

// ===== Semua bentuk kode yang kita punya, SEMUANYA dari sheet =====
// Gak ada yang ditebak di sini. Ini penting: pendekatan lama nyandar ke daftar
// domain brand tebakan (skechers.co.id — gak ada, yang bener skechers.id), jadi
// tiap salah tebak bikin satu brand lumpuh diam-diam.
const codes = [];
function addCode(v) {
  const s = String(v || '').trim().toUpperCase();
  if (s && codes.indexOf(s) === -1) codes.push(s);
}
addCode(article);
// GENERIC bukan cuma kode internal: situs distributor lokal justru pakai ini
// (skechers.id nampilin SKE150802NAT, sementara skechers.com global gak punya
// warna NAT sama sekali). Jadi dia kode pencarian yang sah, bukan sampah.
addCode(gen);
addCode(artDash);
if (am) addCode(am[1] + '-' + am[2]);
// CATATAN: kode model doang ("150802") SENGAJA gak dimasukin. Itu bakal bikin
// halaman warna lain (150802_BBK) lolos sebagai kecocokan persis.

const pisah = artDash || artSplit;
const base = [brand, model].filter(Boolean).join(' ').trim();
const hasQuery = !!(codes.length || base);

// ===== Domain resmi brand: DICARI, bukan ditebak =====
// Kenyataan yang dites langsung ke spider: tanpa "site:", halaman skechers.id
// GAK PERNAH muncul — ketimbun skechers.com global. Dengan "site:skechers.id"
// halamannya langsung ketemu, jadi halamannya keindeks, cuma tenggelam.
// country_code:'id' udah dites dan TIDAK nolong (hasilnya tetap global).
//
// Jadi "site:" tetap dibutuhin. Yang salah dulu bukan "site:"-nya, tapi domainnya
// gua tebak dari pola ".co.id" (skechers.co.id gak ada; yang bener skechers.id).
// Sekarang domainnya dicari sekali per brand, hasilnya disimpen di memori workflow.
const sdb = $getWorkflowStaticData('global');
sdb.brandDomains = sdb.brandDomains || {};
const bkey = brand.toUpperCase();

if (brand && !sdb.brandDomains[bkey]) {
  const tokens = brand.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length >= 4);
  const found = [];
  try {
    const res = await this.helpers.httpRequest({
      method: 'POST',
      url: 'https://api.spider.cloud/search',
      headers: { 'Authorization': 'Bearer SPIDER_API_KEY_DISINI', 'Content-Type': 'application/json' },
      body: { search: brand + ' official site indonesia', search_limit: 6, fetch_page_content: false },
      json: true,
      timeout: 45000
    });
    const arr = (res && (res.content || res.results)) || (Array.isArray(res) ? res : []);
    for (const r of arr) {
      const m = String((r && (r.url || r.link)) || '').match(/^https?:\\/\\/([^\\/?#]+)/i);
      if (!m) continue;
      const h = m[1].replace(/^www\\./, '').toLowerCase();
      // Iklan mesin cari & marketplace bukan situs brand.
      if (/duckduckgo|bing\\.com|google\\./.test(h)) continue;
      if (/shopee|tokopedia|lazada|blibli|bukalapak|amazon|ebay|aliexpress/.test(h)) continue;
      // Host harus ngandung nama brand -> itu tanda situs resmi/afiliasi resmi.
      // "hoka one one" -> token "hoka" -> hoka.com & hokastoreindonesia.com kena.
      if (!tokens.some(t => h.indexOf(t) !== -1)) continue;
      if (found.indexOf(h) === -1) found.push(h);
    }
  } catch (e) { /* gagal nyari domain jangan matiin baris ini */ }
  sdb.brandDomains[bkey] = found.slice(0, 3);
}
const BRAND_SITES = (brand && sdb.brandDomains[bkey]) || [];

// Query: kode polos + nama, plus kode di situs brand yang BARUSAN DITEMUIN.
// country_code sengaja gak diisi (udah dites, gak ngefek).
const batch = [];
for (const c of codes) {
  batch.push({ search: [brand, c].filter(Boolean).join(' ').trim(), search_limit: 10 });
}
if (pisah) batch.push({ search: [brand, pisah].filter(Boolean).join(' ').trim(), search_limit: 10 });
if (base) batch.push({ search: base, search_limit: 10 });
for (const bs of BRAND_SITES) {
  batch.push({ search: (codes[0] || model) + ' site:' + bs, search_limit: 6 });
}

// sku_variants dipakai Candidate Verify buat exact-match. Semua bentuk kode ikut,
// termasuk GENERIC — pencocokannya normalisasi (buang non-alfanumerik) di kedua
// sisi, jadi "150802_NAT" atau "SKE150802NAT" di halaman sama-sama kena.
return [{ json: {
  row_number: o.row_number,
  brand, model, sku: article,
  base, article, has_article: !!article,
  sku_variants: codes,
  // Peringkat kandidat ditentuin sama ADA-TIDAKNYA kode di URL/judul, bukan sama
  // daftar domain. Ini yang bikin pencariannya global: situs manapun, brand manapun.
  article_codes: codes,
  // Dikosongin dengan sengaja. Dulu ini daftar domain brand hasil tebakan dan dia
  // yang nyetir peringkat — salah tebak domain = brand itu gak pernah ketemu.
  brand_sites: BRAND_SITES,
  // Yang dicari LINK, bukan bahan buat kie.ai — jadi sumber gak harus situs resmi
  // brand. Marketplace dibolehin karena justru dia yang paling lengkap nyimpen tiap
  // colorway (link manual yang udah ada pun dari Yahoo Shopping Taiwan).
  allow_marketplace: true,
  // Jangan berhenti di kandidat yang cuma mirip judul; terusin sampai ketemu halaman
  // yang kode artikelnya beneran ada. Konsekuensinya bisa nge-scrape sampai 4 kandidat
  // per baris (sebelumnya sering cukup 1), jadi biaya spider naik.
  strict_article: true,
  has_query: hasQuery,
  search_batch: batch
} }];
`;

// search_batch itu array; HTTP Request jalan per-item, jadi dipecah dulu.
exports.splitSearchBatch = `
const o = $input.first().json;
const batch = Array.isArray(o.search_batch) ? o.search_batch : [];
if (!batch.length) return [];
return batch.map(b => ({ json: { search: b.search, search_limit: b.search_limit } }));
`;

// Gantiin rangkaian Loop Over Candidates -> Check Already Found -> Candidate Verify
// -> Aggregate Links. SEMUA kandidat di-scrape barengan (HTTP node jalan per-item),
// node ini yang milih.
//
// Kenapa loop dalamnya dibuang: SplitInBatches bersarang di n8n gak balik ke posisi
// awal pas loop luar maju ke baris berikutnya. Akibatnya cuma BARIS PERTAMA yang
// kandidatnya kescrape; baris kedua dan seterusnya langsung keluar lewat jalur
// "done" tanpa scrape sama sekali -> NOT FOUND selamanya, seberapa bener pun
// artikelnya. Terbukti di run: 150802NAT ketemu, 150863NTB dan sisanya nol.
//
// Logika ekstraksinya mirip local.candidateVerify dan itu disengaja: alur kontrolnya
// beda total (sekaligus vs satu-satu). Yang gak boleh beda cuma ATURAN COCOK, dan itu
// sama-sama dijaga pakai normalisasi buang non-alfanumerik.
exports.pickBestLink = `
const row = $('Loop Over Rows').first().json;
const bs = $('Build Search').first().json;
const kandidat = $('Rank Candidates').all().map(i => i.json);
const scrapes = $input.all().map(i => i.json);

function parseHtml(json) {
  let obj = json;
  if (typeof obj === 'string') return obj;
  if (obj && typeof obj.data === 'string') {
    const s = obj.data.trim();
    if (s.startsWith('<')) return obj.data;
    try { obj = JSON.parse(obj.data); } catch (e) { return obj.data; }
  }
  if (Array.isArray(obj) && obj[0]) return obj[0].content || obj[0].html || obj[0].raw || '';
  if (obj && typeof obj.content === 'string') return obj.content;
  if (obj && typeof obj.html === 'string') return obj.html;
  if (obj && typeof obj.raw === 'string') return obj.raw;
  return '';
}
function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function tok(v) {
  const stop = new Set(['men','women','mens','womens','unisex','original','shoes','shoe','sneaker','sneakers','sepatu']);
  return new Set(String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(t => t && !stop.has(t)));
}
function overlap(a, b) {
  const A = tok(a), B = tok(b);
  if (!A.size || !B.size) return 0;
  let i = 0;
  for (const t of A) { if (B.has(t)) i++; }
  return i / Math.min(A.size, B.size);
}

const codes = (Array.isArray(bs.sku_variants) ? bs.sku_variants : []).map(norm).filter(c => c.length >= 5);

const nilai = [];
for (let i = 0; i < kandidat.length; i++) {
  const c = kandidat[i] || {};
  const raw = String(parseHtml(scrapes[i]) || '');
  if (!raw) continue;

  let title = '';
  const tm = raw.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (tm) title = tm[1];
  if (!title) { const h = raw.match(/<title[^>]*>([\\s\\S]{0,200}?)<\\/title>/i); if (h) title = h[1].trim(); }

  const punyaGambar = /og:image/i.test(raw) || /<img[^>]+src=/i.test(raw);

  // Kode ketemu di halaman ATAU di URL-nya. Normalisasi dua sisi, jadi "150802-nat"
  // di URL dan "SKE150802NAT" di badan halaman sama-sama kena.
  const nRaw = norm(raw), nUrl = norm(c.candidate_url);
  const kodeKetemu = codes.some(k => nRaw.indexOf(k) !== -1 || nUrl.indexOf(k) !== -1);

  const skorJudul = Math.round(overlap(bs.base || bs.brand || '', title || c.candidate_title || '') * 100);

  nilai.push({
    url: c.candidate_url || '',
    kodeKetemu, skorJudul, punyaGambar,
    skorKandidat: c.candidate_score || 0
  });
}

// Kode ketemu > punya gambar > skor kandidat. Judul cuma penentu terakhir — dia yang
// dulu bikin halaman warna lain menang.
nilai.sort((a, b) =>
  (Number(b.kodeKetemu) - Number(a.kodeKetemu))
  || (Number(b.punyaGambar) - Number(a.punyaGambar))
  || (b.skorKandidat - a.skorKandidat)
  || (b.skorJudul - a.skorJudul));

const cocok = nilai.filter(n => n.kodeKetemu && n.url);
const mirip = nilai.filter(n => !n.kodeKetemu && n.url && n.punyaGambar && n.skorJudul >= 40);

let link1 = '', link2 = '';
if (cocok.length) {
  link1 = cocok[0].url;
  if (cocok[1]) link2 = cocok[1].url;
  else if (mirip[0]) link2 = mirip[0].url;
} else if (mirip.length) {
  link1 = 'CEK DULU (judul mirip, artikel gak ketemu di halaman) - ' + mirip[0].url;
} else {
  link1 = 'NOT FOUND - artikel ' + (bs.article || '(kosong)')
    + ' | ' + nilai.length + ' halaman dicek'
    + ' | ' + new Date().toISOString().slice(0, 10);
}

return [{ json: {
  row_number: row.row_number,
  'Link Recommendation 1': link1,
  'Link Recommendation 2': link2
} }];
`;

// Rakit hasil jadi 2 kolom link halaman produk.
// Rec 1 = kandidat terverifikasi (artikel kecocokan di halaman, atau judul >= 40%).
// Rec 2 = runner-up yang ke-rekam SEBELUM yang pertama ketemu. Sering kosong, dan itu
// wajar: begitu ada yang verified, sisa kandidat sengaja gak di-scrape biar gak bayar.
exports.aggregateLinks = `
const sd = $getWorkflowStaticData('global');
const key = 'run_' + $execution.id;
const st = sd[key] || { found: false, result: null, bestFallback: null };
const row = $('Loop Over Rows').first().json;

let rc = {};
try { rc = $('Rank Candidates').first().json || {}; } catch (e) {}

const r = st.found ? (st.result || {}) : {};
const fb = st.bestFallback || null;

// Cuma dianggap sah kalau KODE ARTIKEL beneran kelihatan di halamannya.
// Candidate Verify nge-lolosin "titleScore >= 40" sendirian — itu kelonggaran yang
// bikin "Nike Pegasus 41" nyamain puluhan colorway dan nyetor link produk lain.
// Hasil yang cocok judul doang tetap disetor, tapi WAJIB ditandai biar keliatan.
const artikelKetemu = st.found
  && (r.sku_match_type === 'exact' || r.sku_match_type === 'digits');

let link1 = '', link2 = '';

if (artikelKetemu) {
  link1 = r.matched_local_url || '';
  if (fb && fb.matched_local_url && fb.matched_local_url !== link1) link2 = fb.matched_local_url;
} else if (st.found) {
  link1 = 'CEK DULU (judul mirip, artikel gak ketemu di halaman) - ' + (r.matched_local_url || '');
} else if (fb) {
  // Gak ada yang lolos verifikasi tapi ada halaman yang masuk akal + ada gambarnya.
  // Tetap disetor: yang ngecek berikutnya mata creative, bukan API berbayar.
  link1 = 'CEK DULU (belum terverifikasi) - ' + (fb.matched_local_url || '');
} else {
  link1 = 'NOT FOUND - '
    + (rc.article ? ('artikel ' + rc.article) : 'artikel kosong')
    + (rc.spider_error ? (' | spider_error: ' + String(rc.spider_error).slice(0, 80)) : '')
    + ' | ' + new Date().toISOString().slice(0, 10);
}

delete sd[key];

return [{ json: {
  row_number: row.row_number,
  'Link Recommendation 1': link1,
  'Link Recommendation 2': link2
} }];
`;

// Jalur buntu sebelum spider sempat ngasih kandidat. TETAP nulis ke sheet — kalau
// selnya dibiarin kosong, run berikutnya ngambil baris ini lagi dan bayar lagi buat
// hasil yang sama.
exports.deadEnd = `
const o = $input.first().json;
const row = $('Loop Over Rows').first().json;

const sebab = o.has_query === false
  ? 'brand/artikel/nama kosong semua'
  : (o.no_candidates
      ? ('spider gak ngasih kandidat'
         + (o.spider_error ? (' | spider_error: ' + String(o.spider_error).slice(0, 80)) : ''))
      : 'berhenti sebelum ada kandidat');

return [{ json: {
  row_number: row.row_number,
  'Link Recommendation 1': 'NOT FOUND - ' + sebab + ' | ' + new Date().toISOString().slice(0, 10),
  'Link Recommendation 2': ''
} }];
`;

exports.runSummary = `
const items = $input.all();
let ketemu = 0, gagal = 0, dua = 0;
for (const it of items) {
  const l1 = String((it.json && it.json['Link Recommendation 1']) || '');
  const l2 = String((it.json && it.json['Link Recommendation 2']) || '');
  if (!l1 || l1.indexOf('NOT FOUND') === 0) gagal++; else ketemu++;
  if (l2) dua++;
}
return [{ json: {
  total_baris: items.length,
  ketemu, gagal, dapat_2_link: dua,
  message: 'Run selesai: ' + items.length + ' baris | ketemu ' + ketemu
    + ' | gagal ' + gagal + ' | dapat 2 link ' + dua
} }];
`;
