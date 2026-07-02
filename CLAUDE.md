# SNKRS Console — Panduan Proyek (untuk Claude Code)

> Peta cepat proyek. **Source of Truth resmi = `source-of-truth.md` + `workflow.md` + 4 dokumen SOT.** File ini ringkasannya — kalau ada konflik, dokumen SOT yang menang.

Web Ops Console internal buat SneakersFlash (dan brand lain via Brand Profile): content brief, copywriting, humanize, ad variant, social performance, revenue. Otak generatif = **OpenClaw**. Repo & DB **terpisah** dari commerce.

---

## 📚 Source of Truth (WAJIB baca sebelum coding)

Prioritas dari atas ke bawah:

1. **`source-of-truth.md`** — aturan main: Hard Block, No Side-Quests, Mandatory Logging, Strict Validation.
2. **`workflow.md`** — fase kerja (Fase 0 → 3).
3. Dokumen SOT:
   - **`sofware-requirement-spesification.md`** (SRS) — *apa* yang dibangun (fitur, business rules, data model, acceptance).
   - **`information-architecture.md`** (IA) — *struktur* (sitemap, rute, permission matrix).
   - **`design-system.md`** (DS) — *visual* (token, warna, komponen, states).
   - **`user-flow.md`** (UF) — *alur* (main/alt/exception + flowchart).

**Hard Block**: kalau salah satu dari 4 SOT di atas hilang dari folder → JANGAN coding. Masuk mode generate SOT dulu.

---

## 🔄 Workflow (ikutin urut)

| Fase | Fokus | Referensi | Constraint |
|------|-------|-----------|-----------|
| **0** | Validasi SOT | source-of-truth.md | Scan folder; lanjut hanya jika 4 SOT lengkap |
| **1** | Scaffolding | SRS | Struktur folder, config, entry point. **Jangan** bikin UI/logika bisnis |
| **2** | Layout & Nav | IA | Shell (rail/topbar), routing, halaman skeleton. Hanya komponen/warna dasar DS |
| **3** | Detailed | UF + DS | Komponen detail + logika + feedback tiap aksi |

> Feature-milestone (creative → ads/revenue → social/orchestrator) ada di SRS Section 22 (Acceptance). Workflow di atas = urutan teknis build.

---

## 🧱 Stack & Struktur

- **api/** — NestJS (owns Prisma). Module: `auth, user, brand-profile, subject, creative, ads, social, revenue, audit, openclaw`.
- **web/** — Next.js (App Router, `output: 'standalone'`), Tailwind.
- **openclaw/** — skills (`skills/<name>/SKILL.md`) + config.
- Postgres · Redis/BullMQ · Docker + `docker-compose.yml`.

Detail lingkungan: SRS Section 3. Docker/deploy detail: `MASTER-BRIEF.md` (referensi teknis, bukan SOT).

---

## 🔒 Golden Rules (jangan dilanggar)

1. Skill generatif dipanggil **via OpenClaw Gateway** — JANGAN hardcode prompt skill di backend.
2. UI **tidak pernah** akses OpenClaw / Ginee / DB langsung — selalu lewat NestJS.
3. Ads write action (publish/scale) **wajib approval manual** (Owner). Default read-only. Budget naik >30% → konfirmasi ulang.
4. Revenue via **Ginee**, **exclude** order Cancelled/Returned.
5. Secret cuma di env server; token social **encrypted** (`tokenRef` di DB). Jangan commit `.env`.
6. **2 peran**: Owner (penuh + approval + kelola) / Member (kreatif & insights, tanpa approval/manajemen).
7. Output konten customer-facing = **Bahasa Indonesia** (kecuali istilah sneaker English).
8. TS strict, DTO + `class-validator`, no `any`. Error → HTTP status + pesan actionable (bukan stack trace ke UI).

---

## ⚙️ Commands

```bash
docker compose up -d                 # run semua service
cd api && npx prisma migrate dev     # migrate (atau otomatis via api CMD)
# sebelum commit: lint + build api & web
```
Commit kecil per task.

---

## 🧾 Mandatory Logging

Setiap respon yang mengubah kode/file **WAJIB** sertakan tabel **Requirement Log** di akhir:

| Item | Referensi SOT | Status |
|------|---------------|--------|
| ... | SRS/IA/DS/UF-... | done/wip |

---

## 🙋 Butuh input Owner (belum bisa dari dokumen)

- **OpenClaw**: cara jalanin Gateway + `OPENCLAW_GATEWAY_URL`, `OPENCLAW_TOKEN`, `OPENCLAW_AGENT_MODEL`, verifikasi key config `chatCompletions`.
- **Credentials**: Ginee (access/secret key), Meta (IG Graph + Marketing), TikTok (Business).
- Auth & roles **sudah** diputusin: login simpel (akun manual), Owner + Member.

---

## Keputusan yang sudah dikunci
- Repo & DB terpisah dari commerce; revenue via Ginee OpenAPI.
- Auth: login only (no registrasi/MFA); akun dibuat manual oleh Owner.
- Notifikasi: in-app only (no WA/Telegram).
- Out of scope: auto-publish, multi-tenant penuh, light mode.

---

## 🏗️ Status Build

| Fase | Status | Catatan |
|------|--------|---------|
| **0** Validasi SOT | ✅ done | 4 SOT lengkap, tanpa Hard Block |
| **1** Scaffolding | ✅ done | Monorepo api/web/openclaw/docker + config + entry point. Prisma schema 10 model. Module NestJS masih shell kosong (belum ada logika bisnis) |
| **2** Layout & Nav | ✅ done | Shell rail+topbar, 11 rute App Router (route group `(app)`), skeleton semua halaman, nav per-peran (`lib/nav.ts`), token DS dasar (warna/font/radius). Login skeleton statis. Belum ada logika/API |
| **3** Detailed | ✅ code done | Semua 6 slice ditulis: Auth, Users, Brand/Subject, Creative (OpenClaw), Ads+Revenue (Ginee), Social+Orchestrator (BullMQ). Backend module lengkap (controller/service/DTO/guard). Frontend 10 halaman fungsional + primitives DS. **Build Docker api & web lolos** (`docker compose build`). |

**Catatan Fase 3:**
- Validasi build lewat **Docker saja** (`docker compose build`) — JANGAN `npm install`/build di host. Lihat memory `no-local-builds-use-docker`.
- Slice 4–6 butuh **credentials Owner** untuk jalan runtime: OpenClaw (`OPENCLAW_*`), Ginee (`GINEE_*`), Meta/TikTok. Kode sudah siap; tanpa creds endpoint balik error jelas.
- DB: belum ada `prisma/migrations` → container api pakai `prisma db push` + `prisma db seed` saat start (ganti ke `migrate deploy` saat migration resmi dibuat).
- Deploy: taruh `web` di belakang reverse proxy (lihat pola `sneakersflash-store`). Belum di-deploy.