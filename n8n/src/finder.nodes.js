// Source Code node buat workflow Article Image Finder (03-article-image-finder.json).
//
// Bedanya sama 02-local-crawl.json: workflow ini BERDIRI SENDIRI (bukan subworkflow
// yang dipanggil MAIN) dan berhenti di link — TIDAK ada step kie.ai. Creative yang
// ngedit gambarnya sendiri, jadi kita cuma perlu nyetor link gambar + link halaman
// sumbernya balik ke Sheet.
//
// Node Build Search / Rank Candidates / Check Already Found / Candidate Verify
// TIDAK diduplikat di sini — build.js narik langsung dari src/local.nodes.js biar
// gak drift lagi (pelajaran dari MAIN vs Local Crawl yang dulu punya salinan sendiri).

// Baris mana yang diproses. Sheet dipakai bareng creative, jadi jangan asal embat
// semua baris: yang udah 'found' bakal ke-scrape ulang dan itu bayar lagi.
exports.filterPending = `
const OK_STATUS = ['', 'pending', 'retry'];

const out = [];
for (const it of $input.all()) {
  const r = it.json || {};
  const status = String(r.status || '').trim().toLowerCase();
  if (OK_STATUS.indexOf(status) === -1) continue;

  // Minimal harus ada sesuatu buat dicari. Baris kosong di ekor sheet ikut kebaca
  // sama node Google Sheets, dan tanpa guard ini dia jadi query kosong ke spider.
  const brand = String(r.brand || '').trim();
  const sku = String(r.sku || '').trim();
  const model = String(r.model || '').trim();
  if (!brand && !sku && !model) continue;

  out.push({ json: Object.assign({}, r, { brand, sku, model }) });
}

return out;
`;

// search_batch dari Build Search itu array. HTTP Request node jalan per-item, jadi
// array-nya dipecah dulu. country_code & search_limit ikut dari Build Search, jangan
// dihardcode ulang di node HTTP-nya.
exports.splitSearchBatch = `
const o = $input.first().json;
const batch = Array.isArray(o.search_batch) ? o.search_batch : [];
if (!batch.length) return [];
return batch.map(b => ({ json: {
  search: b.search,
  search_limit: b.search_limit,
  country_code: b.country_code
} }));
`;

// Pengganti aggregateLocal. Dua beda penting:
// 1. Sumber baris asli = 'Loop Over Rows' (workflow ini bukan subworkflow, jadi gak ada
//    node 'When Executed by Another Workflow').
// 2. Output-nya kolom link buat Sheet, bukan payload buat pipeline gambar berbayar.
exports.aggregateLinks = `
const sd = $getWorkflowStaticData('global');
const key = 'run_' + $execution.id;
const st = sd[key] || { found: false, result: null, bestFallback: null };
const o = $('Loop Over Rows').first().json;

let rc = {};
try { rc = $('Rank Candidates').first().json || {}; } catch (e) {}

// Jejak kandidat yang kececk, buat QC pas hasilnya kosong. Di dalam loop, .all()
// cuma ngasih eksekusi terakhir — ini emang diagnostik kasar, bukan audit lengkap.
let probes = [];
try {
  probes = $('Candidate Verify + Extract').all().map(i => i.json).map(d =>
    (d.checked_url || '?').replace(/^https?:\\/\\//, '').slice(0, 40)
    + ' [raw:' + (d.debug_raw_len || 0) + ' img:' + (d.debug_images || 0)
    + ' sku:' + (d.debug_sku_in_page ? 'Y' : 'N') + ' title:' + (d.debug_title_score || 0) + ']'
  );
} catch (e) {}

const fb = st.bestFallback || null;
let status, r, message;

if (st.found) {
  status = 'found';
  r = st.result || {};
  message = r.message || '';
} else if (fb) {
  // Beda sama versi kie.ai: di sana kandidat belum terverifikasi DIBUANG karena
  // step berikutnya bayar. Di sini step berikutnya cuma mata creative, jadi link-nya
  // tetap disetor — cukup ditandai biar dicek manual dulu.
  status = 'review_manual';
  r = fb;
  message = 'BELUM TERVERIFIKASI, cek dulu sebelum dipakai: ' + fb.matched_local_url
    + ' [' + fb.tier + '] (' + fb.image_count + ' gambar, title ' + fb.identity_score + ')';
} else {
  status = 'not_found';
  r = {};
  message = 'Tidak ketemu: ' + (o.brand || '') + ' ' + (o.model || o.sku || '')
    + (rc.article ? (' | artikel: ' + rc.article) : ' | ARTIKEL GAK KETURUNAN dari sku ' + (o.sku || ''))
    + (rc.spider_error ? (' | spider_error: ' + rc.spider_error) : '')
    + (probes.length ? (' | dicek: ' + probes.join(' ; ')) : ' | TIDAK ADA KANDIDAT dari spider');
}

delete sd[key];

const imgs = Array.isArray(r.images) ? r.images : [];

return [{ json: {
  row_number: o.row_number,
  brand: o.brand || '',
  model: o.model || '',
  sku: o.sku || '',
  status,
  article: rc.article || '',
  source_url: r.matched_local_url || '',
  source_tier: r.tier || '',
  found_title: r.title || '',
  identity_score: r.identity_score || 0,
  image_count: imgs.length,
  image_1: imgs[0] || '',
  image_2: imgs[1] || '',
  image_3: imgs[2] || '',
  image_4: imgs[3] || '',
  image_5: imgs[4] || '',
  checked_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  message
} }];
`;

// Jalur buntu sebelum spider sempat ngasih kandidat: gak ada query sama sekali, atau
// spider balik kosong. Tetap WAJIB nulis ke Sheet — kalau barisnya dibiarin kosong,
// run berikutnya ngambil dia lagi dan bayar lagi buat hasil yang sama.
exports.deadEnd = `
const o = $input.first().json;
const row = $('Loop Over Rows').first().json;

const reason = o.has_query === false
  ? 'Gak ada query yang bisa dibentuk dari brand/model/sku baris ini'
  : (o.no_candidates
      ? ('Spider gak ngasih kandidat'
         + (o.spider_error ? (' | spider_error: ' + o.spider_error) : '')
         + (Array.isArray(o.debug_domains) && o.debug_domains.length
            ? (' | domain kebaca: ' + o.debug_domains.slice(0, 8).join(', '))
            : ''))
      : 'Berhenti sebelum ada kandidat');

return [{ json: {
  row_number: row.row_number,
  brand: row.brand || '',
  model: row.model || '',
  sku: row.sku || '',
  status: 'not_found',
  article: o.article || '',
  source_url: '', source_tier: '', found_title: '',
  identity_score: 0, image_count: 0,
  image_1: '', image_2: '', image_3: '', image_4: '', image_5: '',
  checked_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  message: reason
} }];
`;

exports.runSummary = `
const items = $input.all();
const counts = {};
for (const it of items) {
  const s = (it.json && it.json.status) || 'unknown';
  counts[s] = (counts[s] || 0) + 1;
}
const breakdown = Object.keys(counts).map(k => k + ': ' + counts[k]).join(', ');
return [{ json: {
  total_rows: items.length,
  breakdown: counts,
  message: 'Run selesai: ' + items.length + ' baris diproses | ' + (breakdown || 'tidak ada detail status')
} }];
`;
