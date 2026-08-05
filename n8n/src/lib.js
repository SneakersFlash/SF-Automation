// Kode bersama yang di-inject ke Code node "Build Keyword" (MAIN) dan "Build Search" (Local Crawl).
// SATU SUMBER. Dulu dua workflow punya salinan sendiri dan udah drift — itu yang bikin
// local crawl nyari pakai kode internal supplier dan gak pernah nemu apa-apa.

exports.deriveVariants = `
// ===== SHARED v18 =====
// Jangan edit di salah satu workflow doang. Ubah di n8n/src/lib.js terus jalanin: node n8n/build.js

function looksLikeArticle(s) {
  const S = String(s || '').toUpperCase();
  return /^[A-Z]{1,3}\\d{4,6}(-\\d{2,3})?$/.test(S)   // IH8984, CT1685-100, DZ5485-612
      || /^\\d{5,6}-\\d{2,3}$/.test(S)                 // 11016-001, 398846-87
      || /^[A-Z]\\d{3}[A-Z]{2,3}\\d?$/.test(S);        // U370AI (New Balance)
}

// Posisi dash beda per brand. PUMA 6+2, Nike/Crocs 6+3. Default coba dua-duanya.
const DASH_SPLIT = {
  puma: [2, 3],
  nike: [3], jordan: [3], crocs: [3], reebok: [3], asics: [3], converse: [3]
};

function deriveVariants(brand, sku, model) {
  const out = new Set();
  const S = String(sku || '').trim().toUpperCase();
  const B = String(brand || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
  const bKey = String(brand || '').toLowerCase().replace(/[^a-z]/g, '');
  if (S) out.add(S);

  // 1) Prefix internal 3 huruf (CCR/CON/DIA/HKE) dibuang.
  //    Guard: huruf pertama prefix harus sama dengan huruf pertama brand, biar kode asli
  //    (Nike CT1685-100, adidas IH8984, NB U370AI) gak ikut kepotong.
  let stripped = '';
  let m = S.match(/^([A-Z]{3})(\\d[\\dA-Z-]{4,})$/);
  if (!m) m = S.match(/^([A-Z]{3})([A-Z]\\d[\\dA-Z-]{3,})$/);
  if (m && B && m[1][0] === B[0]) { stripped = m[2]; out.add(stripped); }

  // 2) Artikel asli sering nempel di ekor model: "... - 11016001"
  let tail = '';
  const tm = String(model || '').toUpperCase().match(/[-\\u2013]\\s*([A-Z]{0,3}\\d[\\dA-Z.\\- ]{3,})\\s*$/);
  if (tm) {
    const cand = tm[1].trim().replace(/\\s+/g, '');
    const digits = (cand.match(/\\d/g) || []).length;
    const letters = (cand.match(/[A-Z]/g) || []).length;
    if (digits >= 5 || (digits >= 4 && letters <= 3)) { tail = cand; out.add(tail); }
  }

  // 3) Sisipin dash. FIX: dulu hardcode 3 digit, jadi PUMA 39884687 -> "39884-687" (ngarang).
  //    Yang bener "398846-87". Sekarang generate semua split yang mungkin; karena varian
  //    dipakai sebagai SET buat exact-match, nambah kandidat itu gratis.
  const splits = DASH_SPLIT[bKey] || [3, 2];
  for (const v of [...out]) {
    if (v.includes('-')) continue;
    const d = v.replace(/[^A-Z0-9]/g, '');
    if (/^\\d{7,9}$/.test(d) || /^[A-Z]{1,2}\\d{6,8}$/.test(d)) {
      for (const n of splits) out.add(d.slice(0, -n) + '-' + d.slice(-n));
    }
  }

  // Varian buat exact-match: cuma bentuk yang masuk akal sebagai style code pabrikan.
  // Kode internal supplier (CCR11016001, 39884687) sengaja DIBUANG di sini — kalau ikut,
  // dia bisa nyangkut di regex halaman dan bikin false positive "verified 100".
  const variants = [...out].filter(v => v && looksLikeArticle(v));

  const strong = stripped || tail || (looksLikeArticle(S) ? S : '');
  const dashed = variants.find(v => v.includes('-') && v !== S) || '';

  // article = HASIL DERIVASI, BOLEH KOSONG.
  // Dulu di-fallback ke sku mentah -> query jadi "CONVERSE CONA01887", mustahil ketemu.
  const article = dashed || strong || '';

  return { variants, stripped, tail, article, has_article: !!article };
}

// Naikin URL gambar ke resolusi maksimum SEBELUM dikirim ke kie.ai.
// Thumbnail 300px masuk -> hasil enhance jelek, dan tetep bayar.
// Bonus: nyeragamin URL, jadi gambar sama beda param ukuran gak kehitung dua kali.
function maxRes(u) {
  if (!u) return '';
  let s = String(u).trim();
  if (/images\\.stockx\\.com/i.test(s)) s = s.split('?')[0] + '?fm=jpg&q=95&w=1400';
  else if (/image\\.goat\\.com/i.test(s)) s = s.replace(/image\\.goat\\.com\\/\\d+\\//, 'image.goat.com/1500/').split('?')[0];
  return s;
}
`;
