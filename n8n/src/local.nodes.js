// Source Code node buat workflow Local Crawl / Tier 2 (02-local-crawl.json).

exports.buildSearch = `
{{LIB}}

// Init state terisolasi per-execution. Sekaligus sapu key nyasar dari execution yang
// mati di tengah jalan — dulu key-nya numpuk selamanya di static data.
const sd = $getWorkflowStaticData('global');
const now = Date.now();
for (const k of Object.keys(sd)) {
  if (k.indexOf('run_') === 0 && sd[k] && sd[k].ts && (now - sd[k].ts) > 3600000) delete sd[k];
}
const key = 'run_' + $execution.id;
sd[key] = { found: false, result: null, bestFallback: null, ts: now };

const o = $input.first().json;
const brand = String(o.brand || '').trim();
const rawModel = String(o.model || o.sku || '').trim();
const sku = String(o.sku || '').trim();

const dv = deriveVariants(brand, sku, rawModel);

// Bersihin model: buang artikel di ekor, filler Indonesia, brand dobel
let model = rawModel.replace(/[-\\u2013]\\s*[A-Z]{0,3}\\d[\\dA-Z.\\- ]{3,}\\s*$/i, '').trim();
const FILLER = /\\b(sepatu|sandal|lari|running|jalan|wanita|women|womens|pria|men|mens|unisex|anak|kids|original|terbaru|new|size|ukuran|no|nomor|casual|sneakers|sneaker)\\b/gi;
model = model.replace(FILLER, ' ').replace(/\\s{2,}/g, ' ').trim();
if (brand) {
  const br = new RegExp('\\\\b' + brand.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\b', 'gi');
  model = model.replace(br, ' ').replace(/\\s{2,}/g, ' ').trim();
}
if (!model) model = rawModel;

const brandKey = brand.toLowerCase().replace(/[^a-z]/g, '');
const BRAND_MAP = {
  adidas:['adidas.co.id','adidas.com'], nike:['nike.com'], puma:['puma.com','id.puma.com'],
  reebok:['reebok.com'], asics:['asics.com'], newbalance:['newbalance.co.id','newbalance.com'],
  converse:['converse.co.id','converse.com'], vans:['vans.co.id','vans.com'],
  diadora:['diadora.co.id','diadora.com'], hoka:['hoka.com'],
  on:['on.com','on-running.com'], onrunning:['on.com','on-running.com'], oncloud:['on.com','on-running.com'],
  crocs:['crocs.co.id','crocs.com'], fila:['fila.co.id','fila.com'], skechers:['skechers.com'],
  underarmour:['underarmour.com'], saucony:['saucony.com'], ortuseight:['ortuseight.com'], mizuno:['mizuno.com']
};
const BRAND_SITES = BRAND_MAP[brandKey] || (brandKey ? [brandKey + '.com', brandKey + '.co.id'] : []);

// FIX UTAMA: dulu di sini "article = String(sku)" mentah, beda dari workflow MAIN.
// Akibatnya query jadi "CONVERSE CONA01887" / "PUMA 39884687" -> mustahil ketemu.
// Sekarang pakai deriveVariants() yang sama persis (src/lib.js).
const art = dv.article;

const base = [brand, model].filter(Boolean).join(' ').trim();
const artQuery = art ? [brand, art].filter(Boolean).join(' ').trim() : '';
const hasQuery = !!(artQuery || base);

// Batch artikel-first: nyontek cara manusia nge-Google.
const batch = [];
if (artQuery) batch.push({ search: artQuery, search_limit: 10, country_code: 'id' });
if (base && base !== artQuery) batch.push({ search: base, search_limit: 10, country_code: 'id' });
for (const bs of BRAND_SITES) {
  batch.push({ search: (artQuery || base) + ' site:' + bs, search_limit: 5, country_code: 'id' });
}

return [{ json: Object.assign({}, o, {
  brand, model, sku, base,
  article: art, has_article: dv.has_article, sku_variants: dv.variants,
  has_query: hasQuery, brand_sites: BRAND_SITES, search_batch: batch
}) }];
`;

exports.rankCandidates = `
const o = $('Build Search').first().json;

function collect(anyJson) {
  let out = []; let obj = anyJson;
  if (obj && typeof obj.data === 'string') { try { obj = JSON.parse(obj.data); } catch (e) {} }
  const push = (arr) => { for (const el of arr) { if (!el) continue;
    if (Array.isArray(el)) push(el);
    else if (el.url || el.link) out.push(el);
    else if (Array.isArray(el.results)) push(el.results);
    else if (Array.isArray(el.content)) push(el.content);
    else if (el.data) { try { const p = typeof el.data === 'string' ? JSON.parse(el.data) : el.data; push(Array.isArray(p) ? p : [p]); } catch (e) {} }
  }};
  if (Array.isArray(obj)) push(obj);
  else if (obj && Array.isArray(obj.results)) push(obj.results);
  else if (obj && Array.isArray(obj.content)) push(obj.content);
  else if (obj) push([obj]);
  return out;
}

let raw = []; let spiderError = '';
for (const it of $input.all()) {
  const j = it.json || {};
  let probe = j;
  if (probe && typeof probe.data === 'string') { try { probe = JSON.parse(probe.data); } catch (e) {} }
  if (!spiderError && probe && probe.error) {
    spiderError = typeof probe.error === 'string' ? probe.error : (probe.error.message || JSON.stringify(probe.error).slice(0, 160));
  }
  raw = raw.concat(collect(j));
}

const brand_sites = o.brand_sites || [];

// Kode artikel yang sah buat baris ini (ARTIKEL, GENERIC, bentuk berdash) — dikirim
// dari Build Search, semuanya dari sheet, gak ada yang ditebak. Kalau gak dikirim,
// perilakunya sama persis kayak sebelumnya.
const CODES = (Array.isArray(o.article_codes) ? o.article_codes : [])
  .map(c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .filter(c => c.length >= 5);
function hasCode(s) {
  const n = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return CODES.some(c => n.indexOf(c) !== -1);
}
const RETAILERS = ['planetsports.asia','sportsstation.id','footlocker.com','footlocker.co.id','mapclub.com','map.co.id',
  'sportsdirect.com','jdsports.co.id','zalora.co.id','theiconic.com','rei.com','fleetfeet.com',
  'roadrunnersports.com','shoebacca.com','stansshoes.com','tiso.com'];
// Situs yang gak pernah punya halaman produk beneran: berita, blog, sosmed, forum.
const JUNK_BASE = ['suara.com','kompas.com','detik.com','tribunnews.com','liputan6.com','cnnindonesia.com','idntimes.com','kumparan.com',
  'medium.com','blogspot.com','wordpress.com','pinterest.com','youtube.com','youtu.be','wikipedia.org','reddit.com','facebook.com',
  'instagram.com','tiktok.com','twitter.com','x.com','quora.com'];
// Marketplace: punya halaman produk beneran + gambar, dan justru paling lengkap
// nyimpen tiap colorway. Default tetap dibuang (jalur kie.ai gak mau gambar hasil
// upload seller), tapi dibuka lewat allow_marketplace kalau yang dicari LINK doang.
const MARKETPLACE = ['ebay.com','carousell.com','olx.co.id','olx.com','lazada.co.id','lazada.com',
  'shopee.co.id','shopee.com','tokopedia.com','bukalapak.com','blibli.com','akulaku.com',
  'aliexpress.com','amazon.com','alibaba.com'];
const JUNK = o.allow_marketplace ? JUNK_BASE : JUNK_BASE.concat(MARKETPLACE);
const LISTING = /(\\/search|\\/cari|\\?q=|\\/category\\/|\\/kategori\\/|\\/c\\/|catalogsearch|\\/collections\\/?$|\\/brand\\/|\\/sale\\/?$)/i;

// Subdomain yang bukan toko: store locator, karier, bantuan, blog korporat.
// local.skechers.com lolos inList() karena endsWith('.skechers.com') -> dapet skor
// brand 1.0 dan nangkring di peringkat 1, padahal itu halaman cari-toko.
const NONPRODUCT_SUB = /^(local|locator|stores?|maps?|careers?|jobs|investors?|corporate|support|help|faq|blog|news|press|about)\\./i;

// Halaman depan / path terlalu pendek gak mungkin halaman produk. Tanpa cek ini,
// "https://local.skechers.com/" lolos semua filter dan bisa jadi jawaban.
function pathOf(u) {
  const m = String(u || '').match(/^https?:\\/\\/[^\\/?#]+([^?#]*)/i);
  return (m && m[1] ? m[1] : '/').replace(/\\/+$/, '');
}
function tooShallow(u) {
  const p = pathOf(u);
  return p.replace(/^\\//, '').length < 8;
}

function host(u) { const m = String(u || '').match(/^https?:\\/\\/([^\\/?#]+)/i); return m ? m[1].replace(/^www\\./, '').toLowerCase() : ''; }
// exact match / subdomain saja — includes() dulu bikin 'amazon.com' ketembak sebagai brand-site 'on.com'
function inList(h, list) { return list.some(d => h === d || h.endsWith('.' + d)); }
function tok(v) { const stop = new Set(['adidas','asics','nike','reebok','puma','crocs','diadora','hoka','new','balance','converse','vans','men','women','mens','womens','unisex','original','shoe','shoes','sneaker','sneakers','sepatu']); return new Set(String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(t => t && !stop.has(t))); }
function overlap(a, b) { const A = tok(a), B = tok(b); if (!A.size || !B.size) return 0; let i = 0; for (const t of A) { let m = B.has(t); if (!m) for (const u of B) { if (t.length >= 4 && u.length >= 4 && (t.includes(u) || u.includes(t))) { m = true; break; } } if (m) i++; } return i / Math.min(A.size, B.size); }

const seen = new Set(); const scored = []; const debugSeen = [];
for (const r of raw) {
  const url = r.url || r.link || ''; const title = r.title || r.name || '';
  if (!url || seen.has(url)) continue; seen.add(url);
  const h = host(url); if (!h) continue;
  debugSeen.push(h);
  if (inList(h, JUNK)) continue;
  if (LISTING.test(url)) continue;
  if (NONPRODUCT_SUB.test(h)) continue;
  if (tooShallow(url)) continue;

  let tier = 'other', domainScore = 0.45;
  if (inList(h, brand_sites)) { tier = 'brand'; domainScore = 1.0; }
  else if (inList(h, RETAILERS)) { tier = 'retail'; domainScore = 0.75; }

  // Kode artikel kelihatan di URL atau judul = sinyal paling kuat, dan berlaku
  // buat situs manapun. Ini yang bikin pencarian gak gantung daftar domain:
  // domain boleh gak dikenal, asal kodenya nyantol dia tetap naik.
  const codeHit = hasCode(url) || hasCode(title);

  const titleScore = overlap(o.base || ((o.brand || '') + ' ' + (o.model || o.sku || '')), title);
  scored.push({ url, title, host: h, tier, domainScore, titleScore, codeHit,
    finalScore: domainScore * 0.6 + titleScore * 0.4 });
}

// Urutan: yang kodenya nyantol duluan, baru tier domain, baru skor.
// Kalau article_codes gak dikirim (02-local-crawl), codeHit selalu false dan
// urutannya sama persis kayak sebelumnya.
const rank = { brand: 0, retail: 1, other: 2 };
scored.sort((a, b) =>
  (Number(b.codeHit) - Number(a.codeHit))
  || (rank[a.tier] - rank[b.tier])
  || (b.finalScore - a.finalScore));
// Dipotong dari 8 -> 4. Kandidat rank 5+ hampir gak pernah kepakai, tapi tiap satunya
// = satu scrape berbayar. Brand-site udah selalu di urutan atas.
const top = scored.slice(0, 4);

if (!top.length) {
  return [{ json: Object.assign({}, o, {
    candidate_url: '', candidate_title: '', candidate_score: 0, candidate_tier: 'none',
    no_candidates: true, spider_error: spiderError, debug_raw: raw.length,
    debug_domains: [...new Set(debugSeen)]
  }) }];
}
return top.map(c => ({ json: Object.assign({}, o, {
  candidate_url: c.url, candidate_title: c.title, candidate_score: c.finalScore,
  candidate_tier: c.tier, no_candidates: false, spider_error: spiderError,
  debug_domains: [...new Set(debugSeen)]
}) }));
`;

exports.checkAlreadyFound = `
const sd = $getWorkflowStaticData('global');
const st = sd['run_' + $execution.id] || {};
const item = $input.first().json;

// Mode strict_article: berhenti CUMA kalau kode artikelnya beneran ketemu di halaman.
// Tanpa ini, kandidat pertama yang cuma mirip judul udah bikin st.found = true dan
// sisa kandidat gak pernah di-scrape — persis kasus SKECHERS 150802NAT, di mana
// halaman brand warna BBK nyantol lewat judul dan halaman NAT gak pernah dibuka.
// Flag-nya opt-in: tanpa flag, perilakunya sama persis kayak sebelumnya.
const kuat = st.result && (st.result.sku_match_type === 'exact' || st.result.sku_match_type === 'digits');
const berhenti = item.strict_article ? (!!st.found && !!kuat) : !!st.found;

return [{ json: Object.assign({}, item, { already_found: berhenti || !item.candidate_url }) }];
`;

exports.candidateVerify = `
{{LIB}}

const sd = $getWorkflowStaticData('global');
const key = 'run_' + $execution.id;
sd[key] = sd[key] || { found: false, result: null, bestFallback: null, ts: Date.now() };
const st = sd[key];

// o = metadata kandidat (url, tier, brand, model, sku_variants).
// scrapeRes = respons scrape (HTML mentah). Jangan ketuker: input node ini datangnya
// dari Candidate Scrape, jadi $input.first() itu HTML, bukan data kandidat.
const o = $('Check Already Found').first().json;
const scrapeRes = $input.first().json;

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

let raw = '';
try { raw = parseHtml(scrapeRes); } catch (e) {}
raw = String(raw || '');

let product = null;
const ld = [...raw.matchAll(/<script[^>]+application\\/ld\\+json[^>]*>([\\s\\S]*?)<\\/script>/gi)];
for (const m of ld) {
  try {
    let data = JSON.parse(m[1].trim());
    const arr = Array.isArray(data) ? data : (data['@graph'] || [data]);
    for (const n of arr) { const t = n && n['@type']; if (t === 'Product' || (Array.isArray(t) && t.includes('Product'))) { product = n; break; } }
  } catch (e) {}
  if (product) break;
}

let images = [], title = '', pageSku = '', desc = '';
if (product) {
  title = product.name || ''; pageSku = product.sku || product.mpn || '';
  desc = typeof product.description === 'string' ? product.description : '';
  const img = product.image;
  if (Array.isArray(img)) images = img.map(x => typeof x === 'string' ? x : ((x && x.url) || '')).filter(Boolean);
  else if (typeof img === 'string') images = [img];
  else if (img && img.url) images = [img.url];
}
if (!title) { const m = raw.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i); if (m) title = m[1]; }
if (!images.length) { images = [...raw.matchAll(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/gi)].map(m => m[1]); }
if (!images.length) {
  const pats = [
    /<img[^>]+(?:data-src|data-original|src)=["']([^"']+(?:product|media|catalog|image|assets|dw\\/image)[^"']*\\.(?:jpg|jpeg|png|webp))[^"']*["']/gi,
    /<img[^>]+srcset=["']([^"'\\s,]+\\.(?:jpg|jpeg|png|webp))/gi
  ];
  const found = [];
  for (const p of pats) { for (const m of raw.matchAll(p)) found.push(m[1]); }
  images = [...new Set(found)];
}
images = [...new Set(images.filter(Boolean))]
  .filter(u => !/(logo|icon|sprite|placeholder|badge|flag|payment|banner|thumb_?nail_?small)/i.test(u))
  .map(u => u.startsWith('//') ? ('https:' + u) : u)
  .filter(u => /^https?:\\/\\//i.test(u))
  .slice(0, 6);

function normSku(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function tok(v) { const stop = new Set(['adidas','asics','nike','reebok','puma','crocs','diadora','hoka','new','balance','men','women','unisex','original','shoes','shoe','sepatu']); return new Set(String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(t => t && !stop.has(t))); }
function overlap(a, b) { const A = tok(a), B = tok(b); if (!A.size || !B.size) return 0; let i = 0; for (const t of A) { let m = B.has(t); if (!m) for (const u of B) { if (t.length >= 4 && u.length >= 4 && (t.includes(u) || u.includes(t))) { m = true; break; } } if (m) i++; } return i / Math.min(A.size, B.size); }
function skuSegs(s) { return String(s || '').split(/[^0-9]+/).filter(x => x.length >= 2); }
function skuRe(sku) { const s = skuSegs(sku); return s.length ? new RegExp(s.join('[^0-9]{0,10}')) : null; }

const variants = (Array.isArray(o.sku_variants) ? o.sku_variants : []).filter(Boolean);
const normRaw = normSku(raw);
const normPageSku = normSku(pageSku);

let skuExact = false, skuDigit = false;
for (const v of variants) { const tv = normSku(v); if (tv && (normPageSku.includes(tv) || normRaw.includes(tv))) { skuExact = true; break; } }
if (!skuExact) {
  // FIX: tes digit ke SELURUH HTML cuma boleh buat varian yang bentuknya beneran style code.
  // Kode internal numerik (39884687) bisa nyangkut di product-id/harga/script -> dulu
  // langsung dianggap "verified, skor 100" padahal halamannya produk lain.
  for (const v of variants) {
    if (!looksLikeArticle(v)) continue;
    const re = skuRe(v);
    if (re && (re.test(title) || re.test(pageSku) || re.test(raw))) { skuDigit = true; break; }
  }
}
const skuInPage = skuExact || skuDigit;
const titleScore = Math.round(overlap((o.brand || '') + ' ' + (o.model || o.title || ''), title || o.candidate_title) * 100);
const verified = (skuInPage || titleScore >= 40) && images.length >= 1;

// Boleh NAIK KELAS: hasil yang cuma cocok judul digantikan kalau nemu halaman yang
// kode artikelnya beneran ada. Tanpa ini, mode strict_article percuma — dia terus
// nge-scrape kandidat berikutnya tapi hasil bagusnya gak pernah kepakai.
// Di mode lama gak ngefek: loop-nya udah berhenti di temuan pertama.
const sudahKuat = st.result && (st.result.sku_match_type === 'exact' || st.result.sku_match_type === 'digits');
const iniKuat = skuExact || skuDigit;

if (verified && (!st.found || (iniKuat && !sudahKuat))) {
  st.found = true;
  st.result = {
    source: 'local_crawl', tier: o.candidate_tier, matched_local_url: o.candidate_url,
    title: title || o.candidate_title || '', description: desc,
    identity_score: skuInPage ? 100 : titleScore,
    sku_match_type: skuExact ? 'exact' : (skuDigit ? 'digits' : 'title'),
    image_count: images.length, images,
    image_lateral: images[0] || '', image_medial: images[1] || '',
    image_top: images[2] || '', image_back: images[3] || '',
    message: images.length + ' gambar dari ' + o.candidate_url + ' [' + o.candidate_tier + '] (skor ' + (skuInPage ? 100 : titleScore) + ')'
  };
}

if (!st.found && images.length >= 1 && (o.candidate_tier === 'brand' || o.candidate_tier === 'retail') && titleScore >= 20) {
  const prev = st.bestFallback ? st.bestFallback.cscore : -1;
  if ((o.candidate_score || 0) > prev) {
    st.bestFallback = {
      cscore: o.candidate_score || 0, tier: o.candidate_tier, matched_local_url: o.candidate_url,
      title: title || o.candidate_title || '', description: desc, identity_score: titleScore,
      image_count: images.length, images,
      image_lateral: images[0] || '', image_medial: images[1] || '',
      image_top: images[2] || '', image_back: images[3] || '',
      message: '(BELUM TERVERIFIKASI) ' + images.length + ' gambar dari ' + o.candidate_url + ' [' + o.candidate_tier + '] (title ' + titleScore + ')'
    };
  }
}

return [{ json: {
  checked_url: o.candidate_url || '(NO URL)', tier: o.candidate_tier || '(NO TIER)', verified,
  debug_title: title || o.candidate_title || '', debug_images: images.length, debug_raw_len: raw.length,
  debug_variants: variants.join(','), debug_sku_in_page: skuInPage, debug_title_score: titleScore
} }];
`;

exports.aggregateLocal = `
// Kalau true, hasil yang BELUM terverifikasi tetap diteruskan ke pipeline gambar berbayar.
// Sengaja false: mendingan masuk antrean cek manual daripada bayar kie.ai buat produk
// yang belum tentu bener.
const ALLOW_UNVERIFIED = false;

const sd = $getWorkflowStaticData('global');
const key = 'run_' + $execution.id;
const st = sd[key] || { found: false, result: null, bestFallback: null };
const o = $('When Executed by Another Workflow').first().json;
let rc = {}; try { rc = $('Rank Candidates').first().json || {}; } catch (e) {}

let probes = [];
try {
  probes = $('Candidate Verify + Extract').all().map(i => i.json).map(d =>
    (d.checked_url || '?').replace(/^https?:\\/\\//, '').slice(0, 40)
    + ' [raw:' + (d.debug_raw_len || 0) + ' img:' + (d.debug_images || 0)
    + ' sku:' + (d.debug_sku_in_page ? 'Y' : 'N') + ' title:' + (d.debug_title_score || 0) + ']'
  );
} catch (e) {}

const fb = st.bestFallback || null;
let found, status_hint, r, message;

if (st.found) {
  found = 1; status_hint = 'local_crawl'; r = st.result || {}; message = r.message;
} else if (fb && ALLOW_UNVERIFIED) {
  found = 1; status_hint = 'local_crawl_unverified'; r = fb; message = fb.message;
} else if (fb) {
  found = 0; status_hint = 'local_review_manual'; r = {};
  message = 'Ada kandidat tapi identitas belum terverifikasi, gambar TIDAK diproses. Cek manual: '
    + fb.matched_local_url + ' [' + fb.tier + '] (' + fb.image_count + ' gambar, title ' + fb.identity_score + ')';
} else {
  found = 0; status_hint = 'local_not_found'; r = {};
  message = 'Tidak ketemu: ' + (o.brand || '') + ' ' + (o.model || o.sku || '')
    + (rc.article ? (' | artikel: ' + rc.article) : ' | ARTIKEL GAK KETURUNAN dari sku ' + (o.sku || ''))
    + (rc.spider_error ? (' | spider_error: ' + rc.spider_error) : '')
    + (probes.length ? (' | dicek: ' + probes.join(' ; ')) : ' | TIDAK ADA KANDIDAT dari spider');
}

delete sd[key];

return [{ json: {
  found, status_hint, source: r.source || status_hint, tier: r.tier || '',
  matched_local_url: r.matched_local_url || '', title: r.title || '', description: r.description || '',
  identity_score: r.identity_score || 0, image_count: r.image_count || 0, images: r.images || [],
  image_lateral: r.image_lateral || '', image_medial: r.image_medial || '',
  image_top: r.image_top || '', image_back: r.image_back || '',
  row_number: o.row_number, brand: o.brand, model: o.model, sku: o.sku, message
} }];
`;
