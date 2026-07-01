# SNKRS Console

Web Ops Console internal untuk SneakersFlash (multi-brand via Brand Profile): content brief, copywriting, humanize, ad variant, social performance, revenue. Otak generatif = **OpenClaw**. Repo & DB **terpisah** dari commerce.

> Source of Truth: `source-of-truth.md` + `workflow.md` + 4 dokumen SOT (SRS/IA/DS/UF). Detail teknis: `MASTER-BRIEF.md`. Panduan: `CLAUDE.md`.

## Stack
- **api/** — NestJS (owns Prisma) · Postgres · Redis/BullMQ
- **web/** — Next.js (App Router, `output: 'standalone'`) · Tailwind
- **openclaw/** — Gateway config + skills
- Docker + `docker-compose.yml`

## Struktur
```
api/        NestJS backend (auth, user, brand-profile, subject, creative, ads, social, revenue, audit, openclaw)
web/        Next.js frontend (App Router)
openclaw/   Gateway config + skills
docker/     Dockerfiles (api, web)
```

## Menjalankan (Docker)
```bash
cp .env.example .env      # isi semua secret
docker compose build
docker compose up -d      # migrate deploy jalan otomatis (api CMD)
docker compose logs -f api
```

## Dev lokal
```bash
# api
cd api && npm install && npx prisma generate && npm run start:dev
# web
cd web && npm install && npm run dev
```

## Status build
Fase 1 — **Scaffolding** (struktur folder, config, entry point). Belum ada UI/logika bisnis.

Urutan fase: 0 Validasi SOT → 1 Scaffolding → 2 Layout & Nav (IA) → 3 Detailed (UF + DS).
