# SNKRS Console

Web Ops Console internal untuk SneakersFlash (multi-brand via Brand Profile): content brief, copywriting, humanize, ad variant, social performance, revenue. Otak generatif = **OpenClaw**. Repo & DB **terpisah** dari commerce.

> Source of Truth: `source-of-truth.md` + `workflow.md` + 4 dokumen SOT (SRS/IA/DS/UF). Detail teknis: `MASTER-BRIEF.md`. Panduan kerja: `CLAUDE.md`. Handoff sesi: `PROGRESS.md`.

## Status
**Fase 0–3 selesai & DEPLOYED (live).**
- Web: **https://ai.sneakersflash.com** · API: **https://ai-api.sneakersflash.com/api**
- Jalan penuh: Auth, Users, Brand Profile, Subject, Creative (brief/copy/humanize via OpenClaw), Ads (generate + approval), Audit, Orchestrator (content-drop async).
- Nunggu credentials: **Revenue** (Ginee), **Social** (Meta/TikTok) — kode siap, tinggal isi `.env`.

Urutan fase: 0 Validasi SOT → 1 Scaffolding → 2 Layout & Nav (IA) → 3 Detailed (UF + DS).

## Stack
- **api/** — NestJS (owns Prisma) · Postgres · Redis/BullMQ · JWT auth (Owner/Member)
- **web/** — Next.js (App Router, `output: 'standalone'`) · Tailwind · middleware route-guard
- **openclaw/** — mirror `SKILL.md` per skill (source-of-truth); gateway asli jalan di host
- Docker + `docker-compose.yml`

## Struktur
```
api/        NestJS backend (auth, user, brand-profile, subject, creative, ads, social, revenue, audit, openclaw, orchestrator)
web/        Next.js frontend (App Router, route group (app) + /login)
openclaw/   Mirror SKILL.md per skill (content-brief/copywriting/humanize/ads)
docker/     Dockerfiles (api, web)
```

## Menjalankan (Docker — WAJIB, jangan build/npm di host)
```bash
cp .env.example .env      # isi secret; NEXT_PUBLIC_API_URL & JWT_SECRET wajib
docker compose build
docker compose up -d web api postgres redis   # openclaw pakai gateway host (lihat di bawah)
docker compose logs -f api
```
- API saat start: `prisma db push` + seed Owner otomatis, lalu listen `:4000`.
- Owner awal (seed): `owner@sneakersflash.com` / `ChangeMe123!` — ganti setelah login.
- `NEXT_PUBLIC_API_URL` di-*bake* saat build web → rebuild `web` kalau URL berubah.

## OpenClaw (generatif)
- Gateway jalan di **host** (`port 18789`), backend **OpenAI/Codex GPT‑5.5**. Console akses via `http://host.docker.internal:18789/v1/chat/completions` (auth Bearer).
- **4 agent per-module**: `sf-content-brief`, `sf-copywriting`, `sf-humanize`, `sf-ads` (masing-masing workspace + knowledge). Routing lewat `model = openclaw/<agentId>`.
- Skill kontrak I/O ada di `openclaw/skills/*/SKILL.md`.

## Deployment
- Di belakang nginx commerce (`sneakers_nginx_prod`) + SSL Let's Encrypt; container: `sf_console_web`, `sf_console_api`, `sf_console_db`, `sf_console_redis` (join network `sneakersflash_sneakers_dmz`).
- Redeploy: `docker compose build web api && docker compose up -d web api postgres redis`.

## Golden Rules (ringkas — detail di `CLAUDE.md`)
1. Skill generatif via OpenClaw Gateway (jangan hardcode prompt skill di backend).
2. UI jangan akses OpenClaw/Ginee/DB langsung — selalu lewat NestJS.
3. Ads write action wajib approval Owner; budget naik >30% konfirmasi ulang.
4. Revenue via Ginee, exclude order Cancelled/Returned.
5. Secret cuma di env server; token social encrypted (`tokenRef`). Jangan commit `.env`.
6. 2 peran: Owner (penuh) / Member (kreatif & insights).
7. Output customer-facing = Bahasa Indonesia (kecuali istilah sneaker).
8. TS strict, DTO + class-validator, no `any`.
