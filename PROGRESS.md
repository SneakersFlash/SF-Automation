# PROGRESS — SNKRS Console

> Handoff antar-sesi. Update tiap slice selesai. Acuan: `source-of-truth.md` + `workflow.md` + 4 SOT. Status ringkas juga di `CLAUDE.md`.

## Status Fase
- **Fase 0** Validasi SOT — ✅ done
- **Fase 1** Scaffolding — ✅ done (commit `81d1416`)
- **Fase 2** Layout & Nav — ✅ done (commit `f585f5b`)
- **Fase 3** Detailed — ✅ code done (semua 6 slice; build Docker api+web lolos)

## Fase 3 — status per-slice (urutan feature-milestone SRS §22)
1. **Auth** ✅ — login/logout/me/change-password, JWT, seed Owner, guard rute, role asli. FE: form login, AuthProvider/useAuth, middleware, modal ganti password.
2. **Users** ✅ — list/tambah/aktif-nonaktif Member (Owner-only). Guard owner terakhir.
3. **Brand Profile + Subject** ✅ — CRUD profile, set default (unset lainnya), hapus (Owner), subject create/list.
4. **Creative** ✅ — content-brief/copywriting/humanize via OpenClaw Gateway (`openclaw.service.ts`, gerbang tunggal, parse JSON + retry). Catat Generation.
5. **Ads + Revenue** ✅ — generate 4 variant, approval gate (Owner, budget >30% konfirmasi ulang); revenue Ginee HMAC + exclude Cancelled/Returned + snapshot cache.
6. **Social + Orchestrator** ✅ — social account connect/disconnect (tokenRef, bukan token plain) + performance dari snapshot; content-drop async BullMQ (`orchestrator/`).

## Build & Deploy
- **Validasi build = Docker only.** `docker compose build` (api + web) LOLOS. JANGAN `npm install`/build di host.
- Image ke-build: `sf-automation-api`, `sf-automation-web`.
- `.env` dibuat dari `.env.example` (gitignored). Isi minimal untuk build: `NEXT_PUBLIC_API_URL`, `JWT_SECRET`.
- Docker fix yang dilakukan: `npm ci`→`npm install` (belum ada lockfile), `web/public` dibuat, `PORT`/`HOSTNAME` di runner web, build-arg `NEXT_PUBLIC_API_URL`, `.dockerignore`, api CMD `prisma db push && db seed && start`.
- **Belum di-deploy.** Untuk deploy: `docker compose up -d`, taruh `web` di belakang reverse proxy (pola `sneakersflash-store` di `/var/www/sneakersflash-store`: nginx + SSL + healthcheck).

## Nunggu input Owner (blok runtime slice 4–6, bukan blok build)
- OpenClaw: `OPENCLAW_GATEWAY_URL`, `OPENCLAW_TOKEN`, `OPENCLAW_AGENT_MODEL` + isi SKILL.md di `openclaw/skills/<name>/SKILL.md` (content-brief, copywriting, humanize, ads-generate).
- Ginee: `GINEE_ACCESS_KEY`, `GINEE_SECRET_KEY`.
- Meta/TikTok: app id/secret + access token (social + ads write).

## TODO teknis berikutnya
- Buat `prisma/migrations` resmi (butuh DB) → ganti api CMD ke `prisma migrate deploy`.
- Isi SKILL.md OpenClaw + smoke test gateway (lihat `SPIKE-openclaw.md`).
- Reverse proxy config untuk console (mis. `console.sneakersflash.com`) + basic auth/VPN (tool internal, jangan expose publik).
- Uji end-to-end via `docker compose up -d` setelah creds terisi.

## Catatan lingkungan
- Repo `/var/www/SF-Automation`. Git identity `paisalll`. Referensi deploy: `/var/www/sneakersflash-store`.
- **GateGuard** aktif: file baru/edit pertama diblok sekali → present facts → retry. Matikan via env `ECC_GATEGUARD=off`.
