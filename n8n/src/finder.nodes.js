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

  // Udah ada linknya (atau udah ditandai NOT FOUND run sebelumnya) -> lewat.
  // Mau dicari ulang? kosongin selnya di sheet.
  if (link1) continue;

  // Asetnya udah ada di Drive, gak usah dicariin.
  if (ket.indexOf('GDRIVE') !== -1) continue;

  // Tanpa artikel DAN tanpa nama, gak ada yang bisa dicari.
  if (!article && !model) continue;

  out.push({ json: { row_number: r.row_number, brand, article, model } });
}
return out;
`;

// Bangun query. Nyontek cara manusia nge-Google: kode artikel duluan, baru nama.
exports.buildSearchArtikel = `
{{BRANDS}}

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

const BRAND_SITES = brandSites(brand);

// Artikel sering ditulis "model + kode warna" nempel jadi satu: 150802NAT.
// Situs brand nulisnya KEPISAH — Skechers: 150802_NAT. Mesin cari nganggep
// "150802NAT" satu token dan cuma mulangin halaman model yang paling populer
// (150802_BBK), bukan warna yang dicari. Jadi bentuk terpisahnya ikut dicariin.
// Pencocokannya sendiri gak perlu diapa-apain: normSku buang underscore/spasi,
// jadi "150802_NAT" di halaman tetap kena sama varian "150802NAT".
let artSplit = '';
const am = article.match(/^(\\d{4,8})([A-Z]{2,6})$/);
if (am) artSplit = am[1] + ' ' + am[2];

const artQuery = article ? [brand, article].filter(Boolean).join(' ').trim() : '';
const artQuerySplit = artSplit ? [brand, artSplit].filter(Boolean).join(' ').trim() : '';
const base = [brand, model].filter(Boolean).join(' ').trim();
const hasQuery = !!(artQuery || base);

// country_code SENGAJA gak diisi. Kode artikel itu global — link yang selama ini
// dipakai manual malah dari toko Taiwan. Ngunci ke 'id' bikin hasil kesempitan.
const batch = [];
if (artQuery) batch.push({ search: artQuery, search_limit: 10 });
if (artQuerySplit) batch.push({ search: artQuerySplit, search_limit: 10 });
if (base && base !== artQuery) batch.push({ search: base, search_limit: 10 });
// Di situs brand sendiri, bentuk terpisah yang paling sering nyantol.
for (const bs of BRAND_SITES) {
  batch.push({ search: (artSplit || article || model) + ' site:' + bs, search_limit: 5 });
}

// sku_variants dipakai Candidate Verify buat exact-match. Cukup artikel apa adanya:
// pencocokannya normalisasi (buang non-alfanumerik) di kedua sisi, jadi "208188-001"
// di halaman tetap kena sama varian "208188001". Gak perlu bikin varian dash.
return [{ json: {
  row_number: o.row_number,
  brand, model, sku: article,
  base, article, has_article: !!article,
  sku_variants: article ? [article] : [],
  has_query: hasQuery,
  brand_sites: BRAND_SITES,
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
