# SPIKE — OpenClaw Validation

Pre-Fase-1 spike. Tujuan: **buktiin OpenClaw Gateway bisa dipanggil, nge-trigger skill, dan balikin output yang kepakai** — SEBELUM bangun arsitektur penuh. Semua kode di sini **throwaway** (dibuang setelah spike). Jangan bangun app beneran di sini.

**Timebox: ½–1 hari.** Kalau lewat dan masih macet → itu sinyal buat pakai fallback.

---

## 1. Unknown yang divalidasi

| # | Pertanyaan | Kenapa penting |
|---|-----------|----------------|
| U1 | Gateway jalan + endpoint `/v1/chat/completions` aktif & bisa dipanggil? | Ini fondasi semua skill generatif |
| U2 | SKILL.md beneran ke-trigger dari pesan? | Kalau enggak, skill jadi gak ada gunanya |
| U3 | Output bisa dipaksa JSON valid yang parseable? | Ads/structured panel butuh ini |
| U4 | Latency masih wajar buat tombol "Generate"? | Nentuin UX (loading vs kelamaan) |
| U5 | Error/timeout ke-handle (gak nge-hang)? | Reliability |

---

## 2. Success Criteria (terukur)

- **SC1** — `curl` ke endpoint balik HTTP 200 + ada `content`.
- **SC2** — Output berubah signifikan pas SKILL.md di-load (skill ke-trigger), on-brand + Bahasa Indonesia.
- **SC3** — Request "JSON only" → parse sukses **≥ 4 dari 5** percobaan.
- **SC4** — Latency p50 **< ~10 detik** (masih oke pakai loading state).
- **SC5** — Kondisi gagal (matiin Gateway) → client balik error jelas, **gak hang**.

---

## 3. Prasyarat

- OpenClaw Gateway bisa dijalanin (Docker/local) di server kamu.
- Node 20 (buat script test kecil).
- Nilai ini disiapin: `OPENCLAW_GATEWAY_URL`, `OPENCLAW_TOKEN`, `OPENCLAW_AGENT_MODEL`.

---

## 4. Langkah

### Step A — Gateway up + endpoint aktif (U1)
1. Jalanin Gateway di **private network** (jangan expose publik).
2. Aktifin endpoint OpenAI-compatible di config (cek key sesuai versi OpenClaw kamu — kemungkinan `gateway.http.endpoints.chatCompletions.enabled: true`).
3. Smoke test:
```bash
curl -s -X POST "$OPENCLAW_GATEWAY_URL/v1/chat/completions" \
  -H "Authorization: Bearer $OPENCLAW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"$OPENCLAW_AGENT_MODEL"'",
    "messages": [{"role":"user","content":"balas satu kata: pong"}]
  }' | jq '.choices[0].message.content'
```
✅ **SC1** kalau keluar konten.

### Step B — Skill triggering (U2)
1. Taruh SKILL.md test di workspace skill OpenClaw:
```markdown
---
name: copywriting-spike
description: Write short Indonesian sneaker caption for a product. Trigger on "bikin caption".
---
# Copywriting Spike (SNKRS Flash)
Tulis 1 caption IG pendek, Bahasa Indonesia sneakerhead informal, 1 CTA, sebut harga.
Jangan over-claim. Maksimal 1 emoji.
```
2. Kirim pesan pemicu, bandingin **tanpa** vs **dengan** skill:
```bash
curl -s -X POST "$OPENCLAW_GATEWAY_URL/v1/chat/completions" \
  -H "Authorization: Bearer $OPENCLAW_TOKEN" -H "Content-Type: application/json" \
  -d '{"model":"'"$OPENCLAW_AGENT_MODEL"'","messages":[{"role":"user",
    "content":"bikin caption buat Jordan 1 Low Reverse Mocha, harga 2.4jt"}]}' \
  | jq -r '.choices[0].message.content'
```
✅ **SC2** kalau output ngikutin aturan skill (tone, 1 CTA, sebut harga).

### Step C — Structured JSON (U3)
Ulang 5x dengan instruksi JSON:
```bash
for i in 1 2 3 4 5; do
curl -s -X POST "$OPENCLAW_GATEWAY_URL/v1/chat/completions" \
  -H "Authorization: Bearer $OPENCLAW_TOKEN" -H "Content-Type: application/json" \
  -d '{"model":"'"$OPENCLAW_AGENT_MODEL"'","messages":[{"role":"user",
    "content":"Return ONLY valid JSON: {\"hook\":\"\",\"caption\":\"\",\"cta\":\"\"} untuk Jordan 1 Reverse Mocha 2.4jt. No markdown fences."}]}' \
  | jq -r '.choices[0].message.content' \
  | sed 's/```json//g; s/```//g' | jq . >/dev/null 2>&1 \
  && echo "run $i: JSON OK" || echo "run $i: JSON FAIL"
done
```
✅ **SC3** kalau ≥4/5 OK.

### Step D — Dari code path asli + latency + error (U4, U5)
Script kecil (buang setelah spike) — meniru client NestJS:
```js
// spike.mjs — node spike.mjs
const url = process.env.OPENCLAW_GATEWAY_URL + "/v1/chat/completions";
async function call(content, { timeoutMs = 30000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type":"application/json",
        Authorization:`Bearer ${process.env.OPENCLAW_TOKEN}` },
      body: JSON.stringify({ model: process.env.OPENCLAW_AGENT_MODEL,
        messages: [{ role:"user", content }] }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    console.log("latency(ms):", Date.now()-start, "| ok:", !!text);
    return text;
  } catch (e) {
    console.log("ERROR:", e.name, "after", Date.now()-start, "ms");
  } finally { clearTimeout(t); }
}
await call("bikin caption buat NB 1906R Silver, 2.8jt");
```
- Jalanin 3–5x → catat latency (**SC4**).
- Matiin Gateway → jalanin lagi → pastikan balik ERROR cepat, gak hang (**SC5**).

---

## 5. Decision Gate

| Hasil | Keputusan | Aksi |
|-------|-----------|------|
| SC1–5 lolos, latency oke | ✅ **GO — full OpenClaw** | Lanjut arsitektur sesuai SOT/MASTER-BRIEF |
| Jalan tapi JSON goyah / latency tinggi | ⚠️ **CONDITIONAL** | Tambah: retry + strict JSON instruction + streaming/loading; re-test |
| Gateway susah, trigger gak reliable, atau berkali gagal dalam timebox | ❌ **NO-GO** | Pindah ke **Fallback** (Section 6) |

---

## 6. Fallback (kalau NO-GO)

**NestJS panggil LLM API langsung** (Anthropic/OpenAI), skill jadi **system prompt di backend**.

- Isi tiap `SKILL.md` (Appendix A di MASTER-BRIEF) dipindah jadi system prompt di service NestJS.
- **Kontrak I/O skill gak berubah** (Section 8 MASTER-BRIEF) → UI & API tetap sama.
- Trade-off: kehilangan sentralisasi/reuse OpenClaw, tapi lebih simpel & reliable.
- Swap-nya murah karena arsitektur udah "gerbang tunggal NestJS" — cukup ganti isi `openclaw.service.ts` jadi `llm.service.ts`.

> Update `CLAUDE.md` Golden Rule #1 kalau fallback dipakai: "skill = system prompt di backend" (bukan via OpenClaw).

---

## 7. Aturan Spike
- Kode throwaway; **jangan** commit ke repo produksi.
- Cukup 1 skill (copywriting) — pure generatif, gak butuh API eksternal.
- Berhenti pas timebox habis; ambil keputusan Section 5 dengan data apa adanya.
- Hasil spike = 1 keputusan (GO/CONDITIONAL/NO-GO) + catatan latency + catatan JSON reliability.
