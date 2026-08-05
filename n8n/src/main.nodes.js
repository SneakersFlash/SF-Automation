// Source semua Code node buat workflow MAIN (01-main.json).
// Placeholder {{LIB}} diganti isi src/lib.js sama build.js.

exports.buildKeyword = `
{{LIB}}

// Satu sumber kebenaran buat keyword & varian artikel (dipakai StockX, GOAT, dan matching).
// Catatan: pakai .first() bukan .item — Loop Over Rows batch size WAJIB tetap 1.
const row = $('Loop Over Rows').first().json;
const brand = String(row.brand || '').trim();
const sku = String(row.sku || '').trim();
const model = String(row.model || '').trim();

const v = deriveVariants(brand, sku, model);

// Model dibersihin buat fallback keyword: buang artikel di ekor, filler Indonesia, brand dobel.
let cleanModel = model.replace(/[-\\u2013]\\s*[A-Z]{0,3}\\d[\\dA-Z.\\- ]{3,}\\s*$/i, '').trim();
const FILLER = /\\b(sepatu|sandal|lari|running|jalan|wanita|women|womens|pria|men|mens|unisex|anak|kids|original|terbaru|new|size|ukuran|no|nomor|casual|sneakers|sneaker)\\b/gi;
cleanModel = cleanModel.replace(FILLER, ' ').replace(/\\s{2,}/g, ' ').trim();
if (brand) {
  const br = new RegExp('\\\\b' + brand.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\b', 'gi');
  cleanModel = cleanModel.replace(br, ' ').replace(/\\s{2,}/g, ' ').trim();
}

// Kalau artikel gak keturunan, JANGAN nyari pakai kode internal supplier —
// "PUMA 39884687" itu query sampah. Turun ke pencarian nama, hasilnya ditandai buat review.
const search_keyword = v.has_article
  ? [brand, v.article].filter(Boolean).join(' ').trim()
  : [brand, cleanModel || model].filter(Boolean).join(' ').trim();

return [{ json: {
  search_keyword,
  has_sku: !!sku,
  has_article: v.has_article,
  sku_variants: v.variants,
  article: v.article,
  clean_model: cleanModel,
  derived_from: v.stripped ? 'prefix_strip' : (v.tail ? 'model_tail' : (v.has_article ? 'raw' : 'none'))
} }];
`;

const SHARED_HELPERS = `
function cleanDesc(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\\s*\\/?>/gi, '\\n')
    .replace(/<\\/p>/gi, '\\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
}
function normSku(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function firstNonEmpty() {
  const vals = Array.prototype.slice.call(arguments);
  return vals.find(v => v !== undefined && v !== null && String(v).trim() !== '') || '';
}
function getSku(p) { return firstNonEmpty(p.sku, p.style_id, p.styleId, p.styleCode, p.product_sku, p.productSku, p.style); }
function getTitle(p) { return firstNonEmpty(p.title, p.name, p.product_name, p.productName, p.model); }
function getColorway(p) { return firstNonEmpty(p.colorway, p.color, p.colour, p.color_name, p.colorName); }
function getCategory(p) { return firstNonEmpty(p.gender, p.category, p.market, p.size_type, p.sizeType); }
`;

exports.extractStockx = `
{{LIB}}
${SHARED_HELPERS}

function extractAngles(p) {
  // maxRes() dari lib: paksa resolusi tertinggi sebelum gambarnya dibayar ke kie.ai
  const frames = (Array.isArray(p.gallery_360) ? p.gallery_360 : []).map(maxRes).filter(Boolean);
  const gallery = (Array.isArray(p.gallery) ? p.gallery : []).map(maxRes).filter(Boolean);
  const img = maxRes(firstNonEmpty(gallery[0], p.image, p.image_url, p.imageUrl, p.thumbnail, p.media && p.media.imageUrl));
  const all = [...new Set([img].concat(gallery, frames).filter(Boolean))];

  if (frames.length >= 4) {
    const t = frames.length;
    return {
      lateral: frames[0] || '',
      top: frames[Math.round(t * 0.25)] || '',
      medial: frames[Math.round(t * 0.5)] || '',
      back: frames[Math.round(t * 0.75)] || '',
      all, image_count: frames.length, has_360: true
    };
  }
  return {
    lateral: img || '', top: gallery[1] || '', medial: gallery[2] || '', back: gallery[3] || '',
    all, image_count: gallery.length || (img ? 1 : 0), has_360: false
  };
}

const response = $input.first().json;
const inputSkuRaw = $('Loop Over Rows').first().json.sku || '';

// Bedain "API error/rate limit" vs "beneran gak ketemu" -> jangan mark not_found permanen
const apiFailed = !!response.error || (typeof response.status === 'number' && response.status >= 400)
  || (!Array.isArray(response.data) && response.data === undefined && !response.total);
if (apiFailed) {
  const detail = (response.error && (response.error.message || response.error.description))
    || response.message || ('status ' + (response.status || '?'));
  return [{ json: {
    found_stockx: 0, stockx_match_type: 'api_error',
    stockx_api_error: String(detail).slice(0, 200),
    input_sku: inputSkuRaw, matched_stockx_sku: '',
    stockx_candidates: [], stockx_possible_matches: '', has_360: false
  } }];
}

const products = Array.isArray(response.data) ? response.data : [];
const kw = $('Build Keyword').first().json;

// FIX: dulu ada "if (!variantSet.size) variantSet.add(normSku(inputSkuRaw))" — itu maksa
// kode internal supplier jadi patokan exact-match. Kalau gak ada varian artikel, exact-match
// MEMANG mustahil, dan itu harus dilaporin apa adanya.
const variantSet = new Set((kw.sku_variants || []).map(normSku).filter(Boolean));
const hasArticle = !!kw.has_article && variantSet.size > 0;

const candidates = products.slice(0, 12).map((p, index) => {
  const sku = getSku(p);
  const angles = extractAngles(p);
  return {
    source: 'StockX', rank: index + 1, sku, norm_sku: normSku(sku),
    sku_exact: hasArticle ? variantSet.has(normSku(sku)) : false,
    title: getTitle(p), colorway: getColorway(p), category: getCategory(p),
    description: cleanDesc(p.description), angles,
    image_count: angles.image_count || 0, has_360: !!angles.has_360
  };
});

const exact = candidates.filter(c => c.sku_exact).sort((a, b) => (b.image_count || 0) - (a.image_count || 0))[0];
const possible = candidates.slice(0, 5).map(c => (c.sku || 'NO_SKU') + ' | ' + (c.title || 'NO_TITLE'));

if (!exact) {
  const mt = !hasArticle ? 'no_article' : (candidates.length ? 'no_exact_sku_possible_candidates' : 'not_found');
  return [{ json: {
    found_stockx: 0, stockx_match_type: mt, has_article: hasArticle, has_360: false,
    input_sku: inputSkuRaw, matched_stockx_sku: '',
    stockx_lateral: '', stockx_medial: '', stockx_front: '', stockx_back: '',
    title: '', sku: '', description: '',
    stockx_candidates: candidates, stockx_possible_matches: possible.join(' || ')
  } }];
}

return [{ json: {
  found_stockx: exact.angles.lateral ? 1 : 0, stockx_match_type: 'exact_sku', has_article: true,
  input_sku: inputSkuRaw, matched_stockx_sku: exact.sku, has_360: exact.has_360,
  title: exact.title || '', sku: exact.sku || '', description: exact.description || '',
  colorway: exact.colorway || '', category: exact.category || '',
  stockx_lateral: exact.angles.lateral || '', stockx_front: exact.angles.top || '',
  stockx_medial: exact.angles.medial || '', stockx_back: exact.angles.back || '',
  stockx_exact_candidate: exact, stockx_candidates: candidates,
  stockx_possible_matches: possible.join(' || ')
} }];
`;

exports.skipGoat = `
// StockX udah exact SKU DAN punya gallery_360 penuh -> keempat angle kepenuhan dari sana.
// Node GOAT di-skip supaya kuota KicksDB gak kepakai percuma.
// Bentuk output disamain sama Extract GOAT biar Combine Best gak perlu tau bedanya.
const sx = $('Extract StockX').first().json;
return [{ json: {
  found_goat: 0,
  goat_match_type: 'skipped_stockx_sufficient',
  input_sku: sx.input_sku || '',
  matched_goat_sku: '', goat_description: '',
  goat_candidates: [], goat_possible_matches: ''
} }];
`;

exports.extractGoat = `
{{LIB}}
${SHARED_HELPERS}

function extractAngles(p) {
  const imgs = (Array.isArray(p.images) ? p.images : []).map(maxRes).filter(Boolean);
  const main = maxRes(firstNonEmpty(p.image_url, p.imageUrl, p.image, p.thumbnail, imgs[0]));
  const all = [...new Set([main].concat(imgs).filter(Boolean))];

  // Pola umum GOAT: [0]=lateral, [2]=medial, [3]=sole, [5]=back pair, [7]=pair/top
  return {
    lateral: imgs[0] || main || '',
    medial: imgs[2] || '',
    back: imgs[5] || '',
    top: imgs[7] || imgs[5] || '',
    sole: imgs[3] || '',
    main: main || '',
    all, image_count: imgs.length || (main ? 1 : 0), has_multi_angle: imgs.length >= 6
  };
}

const response = $input.first().json;
const inputSkuRaw = $('Loop Over Rows').first().json.sku || '';

const apiFailed = !!response.error || (typeof response.status === 'number' && response.status >= 400)
  || (!Array.isArray(response.data) && response.data === undefined && !response.total);
if (apiFailed) {
  const detail = (response.error && (response.error.message || response.error.description))
    || response.message || ('status ' + (response.status || '?'));
  return [{ json: {
    found_goat: 0, goat_match_type: 'api_error',
    goat_api_error: String(detail).slice(0, 200),
    input_sku: inputSkuRaw, matched_goat_sku: '',
    goat_candidates: [], goat_possible_matches: '', goat_description: ''
  } }];
}

const products = Array.isArray(response.data) ? response.data : [];
const kw = $('Build Keyword').first().json;

// FIX sama kayak Extract StockX: tanpa varian artikel, exact-match mustahil. Jangan dipalsuin.
const variantSet = new Set((kw.sku_variants || []).map(normSku).filter(Boolean));
const hasArticle = !!kw.has_article && variantSet.size > 0;

const candidates = products.slice(0, 12).map((p, index) => {
  const sku = getSku(p);
  const angles = extractAngles(p);
  return {
    source: 'GOAT', rank: index + 1, sku, norm_sku: normSku(sku),
    sku_exact: hasArticle ? variantSet.has(normSku(sku)) : false,
    title: getTitle(p), colorway: getColorway(p), category: getCategory(p),
    description: cleanDesc(p.description), angles,
    image_count: angles.image_count || 0, has_multi_angle: !!angles.has_multi_angle
  };
});

const exact = candidates.filter(c => c.sku_exact).sort((a, b) => (b.image_count || 0) - (a.image_count || 0))[0];
const possible = candidates.slice(0, 5).map(c => (c.sku || 'NO_SKU') + ' | ' + (c.title || 'NO_TITLE'));

if (!exact) {
  const mt = !hasArticle ? 'no_article' : (candidates.length ? 'no_exact_sku_possible_candidates' : 'not_found');
  return [{ json: {
    found_goat: 0, goat_match_type: mt, has_article: hasArticle,
    input_sku: inputSkuRaw, matched_goat_sku: '',
    goat_lateral: '', goat_medial: '', goat_sole: '', goat_back_pair: '', goat_pair: '',
    goat_main: '', goat_description: '',
    goat_candidates: candidates, goat_possible_matches: possible.join(' || ')
  } }];
}

return [{ json: {
  found_goat: exact.angles.lateral ? 1 : 0, goat_match_type: 'exact_sku', has_article: true,
  input_sku: inputSkuRaw, matched_goat_sku: exact.sku, has_goat_angles: exact.has_multi_angle,
  title: exact.title || '', sku: exact.sku || '',
  colorway: exact.colorway || '', category: exact.category || '',
  goat_lateral: exact.angles.lateral || '', goat_medial: exact.angles.medial || '',
  goat_sole: exact.angles.sole || '', goat_back_pair: exact.angles.back || '',
  goat_pair: exact.angles.top || '', goat_main: exact.angles.main || '',
  goat_description: exact.description || '',
  goat_exact_candidate: exact, goat_candidates: candidates,
  goat_possible_matches: possible.join(' || ')
} }];
`;

exports.combineBest = `
const stockx = $('Extract StockX').first().json;
const goat = $input.first().json;
const orig = $('Loop Over Rows').first().json;
const kw = $('Build Keyword').first().json;
const hasArticle = !!kw.has_article;

function normText(v) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\\s+/g, ' ').trim();
}
function tokenSet(v) {
  const stop = new Set(['adidas','nike','new','balance','asics','puma','converse','vans','reebok','jordan','air','shoe','shoes','sneaker','sneakers','men','mens','women','womens','unisex','the','and']);
  return new Set(normText(v).split(' ').filter(t => t && !stop.has(t)));
}
function overlapRatio(a, b) {
  const A = tokenSet(a), B = tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}
function hasKidsSignal(v) {
  return /\\b(gs|grade school|kids|kid|toddler|td|ps|preschool|infant|youth)\\b/i.test(' ' + normText(v) + ' ');
}
function angleCount(c) {
  const a = (c && c.angles) || {};
  return ['lateral','medial','top','back','sole','main'].filter(k => a[k]).length;
}
function compactCandidate(c) {
  return { source: c.source, sku: c.sku, title: c.title, colorway: c.colorway,
    category: c.category, image_count: c.image_count, rank: c.rank };
}

const stockxApiErr = stockx.stockx_match_type === 'api_error';
const goatApiErr = goat.goat_match_type === 'api_error';

function aliasScore(canonical, candidate) {
  let score = 0;
  const titleOverlap = overlapRatio(canonical.title, candidate.title);
  const colorOverlap = overlapRatio(canonical.colorway || canonical.title, candidate.colorway || candidate.title);
  const catA = normText(canonical.category), catB = normText(candidate.category);

  score += Math.round(titleOverlap * 45);
  score += Math.round(colorOverlap * 25);
  if (normText(orig.brand) && normText(candidate.title).includes(normText(orig.brand))) score += 10;
  if (catA && catB && catA === catB) score += 10;
  if (angleCount(candidate) >= 4) score += 5;

  // beda grade anak vs dewasa rawan salah produk, jangan auto-approve
  if (hasKidsSignal(canonical.title + ' ' + canonical.category) !== hasKidsSignal(candidate.title + ' ' + candidate.category)) score -= 30;
  if (titleOverlap < 0.45) score -= 25;
  return Math.max(0, Math.min(100, score));
}

const stockxCandidates = Array.isArray(stockx.stockx_candidates) ? stockx.stockx_candidates : [];
const goatCandidates = Array.isArray(goat.goat_candidates) ? goat.goat_candidates : [];
const allCandidates = goatCandidates.concat(stockxCandidates);

const exactCandidates = [];
if (goat.goat_exact_candidate) exactCandidates.push(goat.goat_exact_candidate);
if (stockx.stockx_exact_candidate) exactCandidates.push(stockx.stockx_exact_candidate);

if (!exactCandidates.length) {
  // API error != produk gak ada. FIX: status ditulis 'pending' (bukan 'retry_later') supaya
  // baris ini keangkut lagi di run berikutnya. Dulu 'retry_later' nyangkut selamanya karena
  // "Get All Pending Rows" cuma ngambil status = pending.
  if (stockxApiErr || goatApiErr) {
    const errs = [
      stockxApiErr ? ('StockX api_error: ' + (stockx.stockx_api_error || '?')) : '',
      goatApiErr ? ('GOAT api_error: ' + (goat.goat_api_error || '?')) : ''
    ].filter(Boolean).join(' | ');
    const message = '[RETRY] API bermasalah, baris ini otomatis diproses ulang run berikutnya. ' + errs;
    return [{ json: {
      found: 0, status_hint: 'pending', title: '', description: '',
      image_lateral: '', image_medial: '', image_top: '', image_back: '',
      sourceInfo: message, message,
      matched_stockx_sku: '', matched_goat_sku: '',
      stockx_match_type: stockx.stockx_match_type || 'api_error',
      goat_match_type: goat.goat_match_type || 'api_error',
      identity_score: 0, possible_matches: '[]'
    } }];
  }

  const possible = allCandidates.slice(0, 8).map(compactCandidate);
  const listed = possible.map(c => c.source + ':' + (c.sku || 'NO_SKU') + ' ' + (c.title || '')).join(' | ');

  // Tanpa artikel, exact-match emang mustahil — bilang apa adanya, jangan nyamar not_found.
  let status_hint, message;
  if (!hasArticle) {
    status_hint = 'no_article_review';
    message = 'Artikel gak bisa diturunin dari sku "' + (orig.sku || '') + '". Pencarian jatuh ke nama produk, jadi identitas belum terverifikasi. Isi kolom article manual. Kandidat: ' + (listed || 'tidak ada');
  } else if (possible.length) {
    status_hint = 'possible_match_review';
    message = 'Exact artikel ' + (kw.article || '') + ' gak ketemu. Ada kandidat mirip tapi gak dipakai otomatis: ' + listed;
  } else {
    status_hint = 'sku_not_found';
    message = 'Exact artikel ' + (kw.article || orig.sku || '') + ' gak ketemu di StockX dan GOAT.';
  }

  return [{ json: {
    found: 0, status_hint, title: '', description: '',
    image_lateral: '', image_medial: '', image_top: '', image_back: '',
    sourceInfo: message, message,
    matched_stockx_sku: stockx.matched_stockx_sku || '',
    matched_goat_sku: goat.matched_goat_sku || '',
    stockx_match_type: stockx.stockx_match_type || 'not_found',
    goat_match_type: goat.goat_match_type || 'not_found',
    identity_score: 0, possible_matches: JSON.stringify(possible)
  } }];
}

// Canonical = sumber exact SKU dengan data paling kaya. GOAT diprioritaskan tipis karena
// title/colorway-nya biasanya lebih rapi.
const canonical = exactCandidates.sort((a, b) => {
  const sa = angleCount(a) + (a.source === 'GOAT' ? 0.1 : 0);
  const sb = angleCount(b) + (b.source === 'GOAT' ? 0.1 : 0);
  return sb - sa;
})[0];

const accepted = exactCandidates.map(c => Object.assign({}, c, { match_type: 'exact_sku', identity_score: 100, priority: 100 }));
const review = [];
for (const c of allCandidates) {
  if (c.sku_exact) continue;
  const score = aliasScore(canonical, c);
  if (score >= 85) accepted.push(Object.assign({}, c, { match_type: 'verified_alias', identity_score: score, priority: 80 }));
  else if (score >= 65) review.push(Object.assign({}, c, { match_type: 'possible_alias_review', identity_score: score }));
}

// ===== Pemilihan angle: URL unik (anti bayar kie 2x) =====
const used = new Set();
function pickAngle(angleName) {
  const ranked = accepted.map(c => {
    const a = c.angles || {};
    let url = '';
    if (angleName === 'lateral') url = a.lateral || a.main || '';
    if (angleName === 'medial') url = a.medial || '';
    if (angleName === 'top') url = a.top || '';
    // FIX: dulu slot "back" ambil a.sole duluan, jadi foto sol nyangkut di slot belakang.
    if (angleName === 'back') url = a.back || a.sole || '';
    return { candidate: c, url };
  }).filter(x => x.url && !used.has(x.url))
    .sort((x, y) => {
      const sy = (y.candidate.priority || 0) + (y.candidate.image_count || 0) + (y.candidate.source === 'GOAT' ? 2 : 0);
      const sx = (x.candidate.priority || 0) + (x.candidate.image_count || 0) + (x.candidate.source === 'GOAT' ? 2 : 0);
      return sy - sx;
    });
  const pick = ranked[0] || { candidate: null, url: '' };
  if (pick.url) used.add(pick.url);
  return pick;
}

const picks = { lateral: pickAngle('lateral'), medial: pickAngle('medial'), top: pickAngle('top'), back: pickAngle('back') };

// Fill pool: gambar galeri sisa buat nambal slot kosong. Ditandai, karena isinya bisa aja
// foto box/detail — pas QC harus keliatan mana yang hasil tambalan.
const poolSeen = new Set(used);
const fillPool = [];
const byPriority = accepted.slice().sort((a, b) => (b.priority || 0) - (a.priority || 0) || (b.image_count || 0) - (a.image_count || 0));
for (const c of byPriority) {
  for (const u of ((c.angles && c.angles.all) || [])) {
    if (u && !poolSeen.has(u)) { poolSeen.add(u); fillPool.push({ candidate: c, url: u }); }
  }
}
const filledFromPool = [];
for (const name of ['lateral','medial','top','back']) {
  if (!picks[name].url && fillPool.length) {
    picks[name] = fillPool.shift();
    used.add(picks[name].url);
    filledFromPool.push(name);
  }
}

const lateral = picks.lateral.url, medial = picks.medial.url, top = picks.top.url, back = picks.back.url;
const ok = [lateral, medial, top, back].filter(Boolean).length;
const hasVerifiedAlias = accepted.some(c => c.match_type === 'verified_alias');
const aliasScores = accepted.filter(c => c.match_type === 'verified_alias').map(c => c.identity_score || 0);
const status_hint = ok === 4
  ? (hasVerifiedAlias ? 'complete_with_verified_alias' : 'complete_exact')
  : (hasVerifiedAlias ? 'partial_with_verified_alias' : 'partial_exact');

const sourceParts = [];
sourceParts.push('canonical: ' + canonical.source + ' exact artikel ' + (canonical.sku || ''));
sourceParts.push('stockx: ' + (stockx.stockx_match_type || 'not_found') + (stockx.matched_stockx_sku ? ' ' + stockx.matched_stockx_sku : ''));
sourceParts.push('goat: ' + (goat.goat_match_type || 'not_found') + (goat.matched_goat_sku ? ' ' + goat.matched_goat_sku : ''));
for (const n of ['lateral','medial','top','back']) {
  const c = picks[n].candidate;
  sourceParts.push(n + ': ' + (c ? c.source + ' ' + c.match_type : 'NONE'));
}
if (filledFromPool.length) sourceParts.push('TAMBALAN GALERI (cek manual): ' + filledFromPool.join(', '));
if (stockxApiErr) sourceParts.push('WARNING stockx api_error: ' + (stockx.stockx_api_error || '?'));
if (goatApiErr) sourceParts.push('WARNING goat api_error: ' + (goat.goat_api_error || '?'));
if (review.length) sourceParts.push('review candidates: ' + review.slice(0, 3).map(c => c.source + ':' + (c.sku || 'NO_SKU') + ' score ' + c.identity_score).join(', '));

return [{ json: {
  found: ok > 0 ? 1 : 0, status_hint,
  title: canonical.title || stockx.title || goat.title || '',
  description: canonical.description || stockx.description || goat.goat_description || '',
  image_lateral: lateral, image_medial: medial, image_top: top, image_back: back,
  canonical_sku: canonical.sku || kw.article || orig.sku || '',
  matched_stockx_sku: stockx.matched_stockx_sku || '',
  matched_goat_sku: goat.matched_goat_sku || '',
  stockx_match_type: stockx.stockx_match_type || 'not_found',
  goat_match_type: goat.goat_match_type || 'not_found',
  // 100 cuma sah kalau canonical = exact artikel pabrikan (dan itu syarat sampai ke sini).
  identity_score: 100,
  filled_from_pool: filledFromPool,
  alias_min_score: aliasScores.length ? Math.min.apply(null, aliasScores) : '',
  possible_matches: JSON.stringify(review.slice(0, 5).map(compactCandidate)),
  source_used: accepted.map(c => c.source + ':' + (c.sku || 'NO_SKU') + ':' + c.match_type).join(' | '),
  sourceInfo: sourceParts.join(' | '),
  message: ok + '/4 angle valid | ' + sourceParts.join(' | ')
} }];
`;

exports.prepLocalInput = `
const orig = $('Loop Over Rows').first().json;
const c = $input.first().json;
return [{ json: {
  row_number: orig.row_number,
  brand: orig.brand,
  model: orig.model || orig.sku || '',
  sku: orig.sku || '',
  prev_status_hint: c.status_hint || '',
  prev_message: c.message || ''
} }];
`;

exports.packageSubworkflow = `
const combine = $input.first().json;
const orig = $('Loop Over Rows').first().json;
return [{ json: Object.assign({}, combine, {
  row_number: orig.row_number,
  brand: orig.brand,
  model: orig.model || orig.sku || '',
  sku: orig.sku || '',
  original_status: orig.status || ''
}) }];
`;

exports.runSummary = `
// Rekap run: item yang balik ke loop (dari Set Status Fail/Final) keluar di output "done"
const items = $input.all();
const counts = {};
for (const it of items) {
  const s = (it.json && (it.json.status || it.json.status_hint)) || 'unknown';
  counts[s] = (counts[s] || 0) + 1;
}
const breakdown = Object.keys(counts).map(k => k + ': ' + counts[k]).join(', ');
return [{ json: {
  total_rows: items.length,
  breakdown: counts,
  message: 'Run selesai: ' + items.length + ' row diproses | ' + (breakdown || 'tidak ada detail status')
} }];
`;
