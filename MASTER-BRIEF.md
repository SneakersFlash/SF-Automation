# SNKRS Console — Master Build Brief
### Single source of truth untuk Claude Code · Ready to build (Docker + Deploy + GitHub)

Web Ops Console buat SneakersFlash (dan brand lain via Brand Profile): generate content brief, copywriting, humanize, ad variant, plus insights (social performance + revenue). Otak generatif pakai OpenClaw. Dokumen ini gabungan lengkap dari semua brief sebelumnya — Claude Code kerjain dari sini.

---

## Daftar Isi
0. Cara pakai (Claude Code)
1. Overview & tujuan
2. Keputusan arsitektur (repo terpisah)
3. Struktur repo
4. Tech stack
5. Data flow
6. Database (Prisma lengkap)
7. Integrasi OpenClaw
8. Skill I/O contracts
9. API contract
10. UI + design system
11. Keamanan & env
12. Docker & deploy
13. GitHub setup
14. Build phases + acceptance
15. Konvensi coding
- Appendix A — OpenClaw skills (SKILL.md lengkap)
- Appendix B — Brand Profile template + SNKRS Flash
- Appendix C — CLAUDE.md untuk repo

---

## 0. Cara pakai (Claude Code)

- Repo **baru & terpisah** dari commerce. Bangun bertahap **Fase 1 → 2 → 3** (Section 14).
- Skill generatif dipanggil **lewat OpenClaw Gateway**, bukan hardcode prompt di backend.
- Guardrail Section 11 = **wajib**.
- Tiap fase punya acceptance criteria — belum lolos = belum selesai.
- Kalau ada ambiguity (auth, penyimpanan hasil), tanya owner sebelum lanjut.

---

## 1. Overview & Tujuan

**Apa**: dashboard web internal buat ngotomatisasi kerja kreatif + insights.
**Tujuan**: potong waktu prep konten drop jadi menit, konsistenin brand voice, satu tempat buat konten + social + revenue, reusable lintas brand.

**Section:**
- **CREATIVE** (brand-profile driven): Content Brief, Copywriting, Humanize
- **INSIGHTS**: Social Performance, Revenue
- **OPS** (scope SNKRS Flash): Ads Engine
- **SETTINGS**: Brand Profiles, Social Accounts

---

## 2. Keputusan Arsitektur — Repo & Service TERPISAH

Console = **repo sendiri, deployable sendiri, DB sendiri.** Bukan bagian dari backend commerce.

**Kenapa terpisah:**
- Docker + deploy + GitHub bersih; Claude Code kerja di repo yang gak nyentuh production commerce.
- Arah multi-brand (Brand Profile + social account per profile) → service terpisah lebih scale.
- Revenue dari **Ginee** (aggregator) → gak wajib nempel ke DB commerce.
- Isolasi keamanan: OpenClaw (akses luas) + surface baru gak nyampur sama data customer.

**Satu titik kopling yang bisa dipilih (revenue):**
- **Opsi A (default): Ginee OpenAPI langsung** — console punya Ginee creds, tarik order → hitung revenue. Fully decoupled.
- **Opsi B: read-only ke Postgres commerce** — kalau lebih milih pakai order yang udah ke-sync webhook Ginee di DB commerce. Pakai DB user **read-only**. Ini satu-satunya titik console nyentuh DB commerce.

Rekomendasi: mulai **Opsi A** (bener-bener lepas). Pindah ke B cuma kalau butuh reconcile detail.

```
┌──────────────────────────────────────────────┐
│  Next.js — Ops Console UI (web)               │
└───────────────────────┬──────────────────────┘
                        │ HTTPS (auth)
                        ▼
┌──────────────────────────────────────────────┐
│  NestJS API (console) — gerbang tunggal       │
│  Creative · Ads · Social · Revenue · Profiles │
└───┬───────────┬───────────┬───────────┬───────┘
    ▼           ▼           ▼           ▼
 OpenClaw   Console DB   Ginee API   Meta/TikTok
 Gateway    (Postgres)   (revenue)   (ads + social)
 (private)  (own data)
```

---

## 3. Struktur Repo (monorepo)

```
snkrs-console/
├── api/                    # NestJS backend (owns Prisma)
│   ├── src/
│   │   ├── creative/       # content-brief, copywriting, humanize, content-drop
│   │   ├── ads/            # generate + performance + approval
│   │   ├── social/         # IG/TikTok analytics + OAuth
│   │   ├── revenue/        # Ginee → metrics
│   │   ├── brand-profile/  # CRUD
│   │   ├── openclaw/       # gateway client
│   │   ├── auth/
│   │   └── main.ts
│   ├── prisma/schema.prisma
│   └── package.json
├── web/                    # Next.js frontend (App Router)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── openclaw/               # config + skills (SKILL.md, lihat Appendix A)
│   ├── skills/
│   └── config.yaml
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── docker-compose.yml
├── .env.example
├── CLAUDE.md               # Appendix C
└── README.md
```

---

## 4. Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | Next.js (App Router, `output: 'standalone'`), React, TS, Tailwind |
| Backend | NestJS, TS, Prisma |
| DB | PostgreSQL (console-owned) |
| Cache/Queue | Redis + BullMQ (content-drop async, snapshot cache) |
| Agent | OpenClaw Gateway (`/v1/chat/completions`) |
| Integrasi | Ginee OpenAPI, Meta (IG Graph + Marketing), TikTok Business API, ImageKit, n8n |
| Infra | Docker + docker-compose, GitHub |

---

## 5. Data Flow

**5a. Skill generatif** (brief/copy/humanize/ads-generate):
```
UI form → POST /api/... → validasi DTO → ambil BrandProfile
  → payload skill → OpenClaw /v1/chat/completions → parse (text/JSON)
  → simpan Generation → balikin ke UI
```
**5b. Revenue**:
```
UI → GET /api/revenue?date → cek RevenueSnapshot cache
  → stale? Ginee order list (skip cancelled) → agregasi by channel → simpan snapshot → balikin
```
**5c. Social**:
```
UI → GET /api/social/performance?brandProfileId&range → cek SocialSnapshot cache
  → stale? IG Graph / TikTok Business API → normalize → simpan snapshot → balikin
```
**5d. content-drop (async)**:
```
UI → POST /api/creative/content-drop → enqueue BullMQ
  → worker: brief → copy → humanize → ads-generate → simpan ContentPack → UI poll/SSE
```
**5e. Ads action (guarded)**:
```
UI Approve → POST /api/ads/actions/:id/approve → cek pending → eksekusi write → executed
  (tanpa approve, NOTHING jalan)
```

---

## 6. Database (Prisma lengkap)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("member") // owner | member
  createdAt DateTime @default(now())
}

model BrandProfile {
  id              String          @id @default(cuid())
  brandName       String
  industry        String?
  audience        String?
  voiceAdjectives String?
  voiceDo         String?
  voiceDont       String?
  platforms       String[]
  outputLanguage  String          @default("id-ID")
  visualAssets    String?
  usp             String?
  ctaDestinations String?
  constraints     String?
  isDefault       Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  subjects        Subject[]
  generations     Generation[]
  socialAccounts  SocialAccount[]
}

model Subject {
  id             String        @id @default(cuid())
  brandProfileId String?
  brandProfile   BrandProfile? @relation(fields: [brandProfileId], references: [id])
  name           String
  details        Json?         // { sku, colorway, price, dropType, specs }
  goal           String?
  createdAt      DateTime      @default(now())
  generations    Generation[]
}

model Generation {
  id             String        @id @default(cuid())
  skill          String        // content-brief | copywriting | humanize | ads-generate | content-drop
  brandProfileId String?
  brandProfile   BrandProfile? @relation(fields: [brandProfileId], references: [id])
  subjectId      String?
  subject        Subject?      @relation(fields: [subjectId], references: [id])
  input          Json
  output         Json
  status         String        @default("done")
  userId         String?
  createdAt      DateTime      @default(now())
  adVariants     AdVariant[]
}

model AdVariant {
  id           String      @id @default(cuid())
  generationId String?
  generation   Generation? @relation(fields: [generationId], references: [id])
  angle        String      // scarcity | price | styling | social_proof
  hook         String
  primaryText  String
  headline     String
  cta          String
  visual       String?
  createdAt    DateTime    @default(now())
}

model AdAction {
  id         String    @id @default(cuid())
  type       String    // publish | scale
  payload    Json
  status     String    @default("pending_approval")
  approvedBy String?
  createdAt  DateTime  @default(now())
  executedAt DateTime?
}

model RevenueSnapshot {
  id        String   @id @default(cuid())
  date      DateTime @unique @db.Date
  data      Json
  createdAt DateTime @default(now())
}

model ContentPack {
  id        String   @id @default(cuid())
  subjectId String?
  data      Json
  status    String   @default("processing")
  createdAt DateTime @default(now())
}

model SocialAccount {
  id             String           @id @default(cuid())
  brandProfileId String
  brandProfile   BrandProfile     @relation(fields: [brandProfileId], references: [id])
  platform       String           // instagram | tiktok
  accountId      String
  handle         String?
  tokenRef       String           // referensi secret; JANGAN simpan token plain
  connectedAt    DateTime         @default(now())
  snapshots      SocialSnapshot[]
  @@unique([brandProfileId, platform, accountId])
}

model SocialSnapshot {
  id              String        @id @default(cuid())
  socialAccountId String
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id])
  date            DateTime      @db.Date
  metrics         Json          // { followers, reach, impressions, engagement_rate, profile_visits }
  topPosts        Json?
  createdAt       DateTime      @default(now())
  @@unique([socialAccountId, date])
}
```

---

## 7. Integrasi OpenClaw

Enable endpoint OpenAI-compatible di Gateway (`gateway.http.endpoints.chatCompletions` — **verifikasi sesuai versi OpenClaw kamu**), bind private network (di compose: network `back` internal, gak publish port), akses cuma dari NestJS via bearer.

```ts
// api/src/openclaw/openclaw.service.ts (pola)
const res = await fetch(`${process.env.OPENCLAW_GATEWAY_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENCLAW_TOKEN}` },
  body: JSON.stringify({
    model: process.env.OPENCLAW_AGENT_MODEL,
    messages: [{ role: 'user', content: skillPayload }],
  }),
});
const data = await res.json();
const text = data.choices?.[0]?.message?.content ?? '';
```
Buat output JSON (ads-generate): instruksiin "return ONLY valid JSON", strip fence, `JSON.parse` di try/catch. Prompt panjang tetep di `SKILL.md` (Appendix A).

---

## 8. Skill I/O Contracts

```
content-brief → { briefs: { <format>: string } }   // format: carousel|story|short_video|static_ad|long_video|thread|email|blog
copywriting   → { hooks: string[5], caption: string, ctas: {soft,urgent,harga}, hashtags: string[] }
humanize      → { text: string }
ads-generate  → [{ angle, hook, primary_text, headline, cta, visual } x4]
revenue       → { tanggal, revenue:{value,delta_vs_kemarin_pct}, order:{value}, aov:{value},
                  top_sku:[{nama,revenue}], per_channel:{web,shopee,tiktok},
                  perlu_action:{order_deket_deadline}, anomali:[{tipe,catatan}] }
social        → { platform, followers:{value,delta_pct}, reach, impressions,
                  engagement_rate, profile_visits, top_posts:[{id,thumbnail,caption,reach,engagement}] }
```
Teks brief/copy: label CAPS + dash (bukan markdown `#`/`*`) biar clean di UI.

---

## 9. API Contract (NestJS, semua `/api`, butuh auth)

| Method | Endpoint | Body / Query | Fase |
|--------|----------|--------------|------|
| POST | `/creative/content-brief` | `{ brandProfileId, subject, formats[] }` | 1 |
| POST | `/creative/copywriting` | `{ brandProfileId, subject, goal }` | 1 |
| POST | `/creative/humanize` | `{ text, brandProfileId? }` | 1 |
| CRUD | `/brand-profiles[/:id]` | profile fields | 1 |
| POST | `/ads/generate` | `{ brandProfileId?, subject }` | 2 |
| GET | `/revenue` | `?date` | 2 |
| POST | `/revenue/cache` | payload (bearer webhook) | 2 |
| GET | `/social/performance` | `?brandProfileId&from&to` | 3* |
| GET | `/social/accounts` | `?brandProfileId` | 3* |
| POST | `/social/accounts/connect/:platform` | OAuth | 3* |
| DELETE | `/social/accounts/:id` | — | 3* |
| POST | `/creative/content-drop` | `{ subjectId }` (async) | 3 |
| GET | `/creative/content-drop/:packId` | — | 3 |
| GET | `/ads/performance` | `?from&to` | 3 |
| POST | `/ads/actions/:id/approve` | — | 3 |

*Social Performance bisa ditarik ke Fase 2.5 kalau creative butuh cepet.

**Revenue (Ginee)**: order list `/openapi/order/v1/list`, agregasi `totalAmount` group by `channel`, **skip status CANCELLED/RETURNED**. Auth Ginee = HMAC-SHA256: `Authorization: {ACCESS_KEY}:base64(hmac_sha256("POST$/openapi/order/v1/list$", SECRET_KEY))`, header `X-Advai-Country: ID`.

---

## 10. UI + Design System

### Routes
```
/                          → redirect /creative/brief
/creative/brief · /creative/copy · /creative/humanize
/insights/social · /insights/revenue
/ads
/settings/brand-profiles · /settings/social-accounts
```

### Layout
Left rail (grup CREATIVE / INSIGHTS / OPS / SETTINGS) + topbar (Brand switcher [creative+social] + Subject chip) + Active Tag bar (hangtag) + panel body.

### Design tokens
```
Color: --ink-900 #14110B (bg) · --ink-800 #1E1A12 · --ink-700 #2A241A (tag)
       --line #3A3122 · --paper #F3ECDD · --paper-dim #B4A88C · --paper-faint #796E58
       --flash #FF5A1F (accent) · --flash-soft rgba(255,90,31,.14)
       --up #6FCF97 · --down #FF6B6B · --watch #E0B341
Type:  Display Archivo (800/900) · Body Inter · Mono JetBrains Mono
Shape: radius card 14 / chip 10; border 1px --line; tag = punch hole + perforasi
Spacing: 4/8/12/16/24/32/48
```

### Signature — Spec Tag
Output (brief/copy/ad) & subject aktif dirender sebagai hangtag: punch hole + header mono (brand·SKU·colorway·harga·drop) + tepi perforasi.

### Komponen
`RailNav`, `BrandSwitcher`, `SubjectBar/Tag`, `FormatChips`, `GenerateButton`, `OutputTag`, `CopyButton`, `MetricCard`, `ChannelBars/TrendBars`, `TopPostsGrid`, `AnomalyBadge`, `ApprovalModal`, `ProfileDrawer`, `SocialConnect`, `EmptyState/LoadingState/ErrorState`.

### States
empty (ajakan aksi) · loading (spinner + skeleton "diprint") · success (tag print-in) · error (pesan + arah + retry) · approval (ads).

### Quality floor
Responsif (rail collapse mobile), focus ring `--flash-soft`, kontras lolos, tap ≥44px, rupiah ribuan, `prefers-reduced-motion`. Microcopy Bahasa Indonesia pro-informal.

---

## 11. Keamanan & Env

- **UI gak pernah** nembak OpenClaw/Ginee/DB langsung — semua lewat NestJS.
- OpenClaw Gateway di network internal (`back`), **gak publish port**.
- Secrets cuma di env server; jangan commit; jangan kirim ke frontend.
- Revenue Opsi B → DB user **read-only**.
- Social token OAuth **encrypted at rest** (atau secret manager), cuma `tokenRef` di DB.
- Ads write action **HARUS** approval manual; default read-only; budget naik >30% konfirmasi ulang.
- Rate limit endpoint generatif; log tiap Generation (audit).
- Console **jangan** ke-expose publik kayak storefront → behind reverse proxy + auth (basic auth / VPN / Cloudflare Tunnel).

### .env.example
```
# App
NODE_ENV=production
API_PORT=4000
WEB_PORT=3000
JWT_SECRET=
NEXT_PUBLIC_API_URL=https://console.internal.example/api

# DB (console-owned)
DATABASE_URL=postgresql://console:pass@postgres:5432/console
# (Opsi B revenue) DATABASE_URL_COMMERCE_RO=

# OpenClaw
OPENCLAW_GATEWAY_URL=http://openclaw:18789
OPENCLAW_TOKEN=
OPENCLAW_AGENT_MODEL=

# Redis
REDIS_URL=redis://redis:6379

# Ginee
GINEE_HOST=https://api.ginee.com
GINEE_ACCESS_KEY=
GINEE_SECRET_KEY=
GINEE_COUNTRY=ID

# Social (Meta IG + TikTok)
META_IG_APP_ID=
META_IG_APP_SECRET=
TIKTOK_APP_ID=
TIKTOK_APP_SECRET=

# Ads (Meta Marketing + TikTok Business)
META_ACCESS_TOKEN=
TIKTOK_ACCESS_TOKEN=

# Webhook
REVENUE_CACHE_WEBHOOK_SECRET=
```

---

## 12. Docker & Deploy

### docker/api.Dockerfile
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY api/package*.json ./
RUN npm ci
COPY api/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
# jalanin migrate lalu start
CMD ["sh","-c","npx prisma migrate deploy && node dist/main.js"]
```

### docker/web.Dockerfile
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build            # next.config: output: 'standalone'

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node","server.js"]
```

### docker-compose.yml
```yaml
services:
  web:
    build: { context: ., dockerfile: docker/web.Dockerfile }
    env_file: .env
    depends_on: [api]
    networks: [front]
    ports: ["3000:3000"]        # taruh di belakang reverse proxy (lihat catatan)
  api:
    build: { context: ., dockerfile: docker/api.Dockerfile }
    env_file: .env
    depends_on: [postgres, redis]
    networks: [front, back]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: console
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: console
    volumes: [pgdata:/var/lib/postgresql/data]
    networks: [back]
  redis:
    image: redis:7-alpine
    networks: [back]
  openclaw:
    image: openclaw/gateway:latest   # sesuaikan image/build OpenClaw kamu
    env_file: .env
    volumes: ["./openclaw:/config"]
    networks: [back]                 # INTERNAL only, TANPA ports:
networks:
  front: {}
  back: { internal: true }
volumes:
  pgdata: {}
```

**Catatan exposure**: cuma `web` yang keluar. Taruh di belakang reverse proxy (Caddy/nginx/Traefik) dengan basic auth atau di belakang VPN/Cloudflare Tunnel — ini tool internal. `openclaw` & `postgres` & `redis` di network `back` internal, gak pernah ke-publish ke publik.

### Deploy di VPS (Claude Code jalan di server)
```bash
git clone git@github.com:<user>/snkrs-console.git
cd snkrs-console
cp .env.example .env      # isi semua secret
docker compose build
docker compose up -d       # migrate deploy jalan otomatis (api CMD)
docker compose logs -f api
```

---

## 13. GitHub Setup

```bash
# di lokal / server
git init
git add .
git commit -m "chore: bootstrap snkrs-console"
gh repo create snkrs-console --private --source=. --remote=origin --push
```
`.gitignore` wajib: `node_modules`, `.env`, `.next`, `dist`, `*.log`.

**GitHub Actions (opsional, ringan)** — `.github/workflows/ci.yml`: lint + build api & web tiap PR. Deploy tetap manual (`git pull && docker compose up -d --build` di server) dulu; auto-deploy nanti kalau udah stabil.

---

## 14. Build Phases + Acceptance

### FASE 1 — Core kreatif
- [ ] Bootstrap repo (struktur Section 3) + Docker + compose jalan lokal
- [ ] Prisma: `User, BrandProfile, Subject, Generation`; migrate; seed profile SNKRS Flash
- [ ] `BrandProfileModule` (CRUD) + `CreativeModule` (brief/copy/humanize) + `openclaw` client + auth + rate limit
- [ ] Web: app shell (rail, topbar, brand switcher, Active Tag) + design tokens
- [ ] Panel Content Brief, Copywriting, Humanize + OutputTag + copy + states

**Acceptance**: dari web, pilih profile + subject, generate brief/copy/humanize, hasil di tag card, bisa copy; semua lewat NestJS→OpenClaw; ganti profile ngubah tone.

### FASE 2 — Ads generate + Revenue (Ginee)
- [ ] Prisma: `AdVariant, RevenueSnapshot`; migrate
- [ ] `AdsModule` MODE A (4 variant) + panel cards
- [ ] `RevenueModule`: Ginee order list → agregasi by channel (skip cancelled) → cache snapshot
- [ ] Panel Revenue (metric cards, top SKU, channel bars, tren 7 hari, anomali)
- [ ] Webhook `/revenue/cache` (bearer)

**Acceptance**: 4 ad variant tampil; Revenue akurat + delta + anomali; cancelled gak kehitung.

### FASE 3 — Social + Orchestrator + Ads performance
- [ ] Prisma: `AdAction, ContentPack, SocialAccount, SocialSnapshot`; migrate
- [ ] `SocialModule`: OAuth connect IG/TikTok + panel Social Performance + snapshot cache
- [ ] `content-drop` via BullMQ (chain 4 skill) + poll/SSE + render pack
- [ ] Ads MODE B (performance read-only) + approval gate (`AdAction` + modal + `/approve`)

**Acceptance**: connect IG+TikTok per profile, panel akurat, ganti profile ganti akun, token gak plain; content-drop keluarin full pack async; performance klasifikasi winner/ok/loser; gak ada write action tanpa approve.

### Out of scope (sekarang)
Auto-publish; roles kompleks; scheduling penuh; light mode.

---

## 15. Konvensi Coding

- TS strict; no `any`. DTO + `class-validator` di semua input.
- NestJS: module per fitur, service tipis, controller cuma routing+validasi.
- Error: HTTP status jelas + pesan actionable (bukan stack trace ke UI).
- Frontend: server components default; client component cuma yang interaktif; no `localStorage` buat data sensitif.
- Jangan hardcode prompt skill di backend — panggil OpenClaw.
- Commit kecil per task.

---

# Appendix A — OpenClaw Skills (SKILL.md)

Taruh tiap block ke `openclaw/skills/<name>/SKILL.md`.

## content-brief (global, brand-agnostic)
```markdown
---
name: content-brief
description: >
  Build a complete creative content brief for ANY brand/product across formats
  (carousel, story, short_video, static_ad, long_video, thread, email, blog).
  Brand-agnostic: voice/audience/platform come from a Brand Profile passed in.
---
# Content Brief Builder (Global)
Needs BRAND PROFILE (context) + SUBJECT (product/campaign) + FORMATS. If no
profile given, ask which to use. Never assume a niche — derive from profile+subject.

Inputs — Brand Profile: brand_name, industry, audience, voice_tone(adjectives/do/dont),
platforms, output_language, visual_assets, usp, cta_destinations, constraints.
Subject: name, key_details (price/sku/colorway/dropType/specs), key_selling_point, goal.
Formats: carousel | story | short_video | static_ad | long_video | thread | email | blog.

Output per format (plain text, CAPS labels + dashes, NO markdown #/*):
- CAROUSEL 3–8 slide: [Slide N] Visual | On-slide text | Production note (slide1=HOOK, last=CTA→cta_destination)
- STORY 1–3 frame 9:16: visual + tap-zone CTA + sticker suggestion
- SHORT_VIDEO: shot list 5–8 (durasi|visual|camera|overlay text|audio cue), 0–2s hook, no copyrighted track names
- STATIC_AD: hero visual + headline ≤7 kata + CTA, ratios 1:1/4:5/9:16
- LONG_VIDEO: title options, 15s hook, segment outline, CTA placements
- THREAD: hook post + 4–8 follow-ups + CTA
- EMAIL: 3 subject lines + preview + body outline + 1 CTA
- BLOG: title + H2 outline + angle + meta description + CTA

Rules: output language = profile.output_language; tone/audience from profile (no hardcode);
map visual_assets to slides/shots; no invented features/claims; respect constraints; actionable.
```

## copywriting
```markdown
---
name: copywriting
description: Conversion-focused copy (hooks, captions, CTAs, hashtags) driven by Brand Profile.
---
# Copywriting Engine
Read tone/output_language/constraints from Brand Profile. Frameworks: HOOK-RETAIN-REWARD (organik),
PAS (ads), AIDA (long caption), 4U (headline).
Output JSON: { hooks:[5 diff angles: scarcity/FOMO/styling/price/hype], caption (3–5 lines,1 CTA),
ctas:{soft,urgent,harga}, hashtags:[3 brand+4 niche+3 broad] }.
Rules: satu CTA per caption; sebut harga+platform di CTA; no over-claim; max 1 emoji /1–2 baris.
```

## humanize-ai
```markdown
---
name: humanize-ai
description: Rewrite AI-sounding copy into natural voice per Brand Profile.
---
# Humanize AI
Remove AI tells: klise openers, em-dash overuse, corporate words, uniform sentence length, stiff listicles.
Apply: varied sentence length, spoken rhythm, light slang per platform, keep key info (harga/size/CTA).
Read voice_tone + output_language from profile. Output ONLY the rewritten text. Don't change facts.
```

## ads-engine
```markdown
---
name: ads-engine
description: Generate ad variants (MODE A) + performance review (MODE B) for Meta/TikTok.
---
# Ads Engine
MODE A: 4 concepts (angles: scarcity, price, styling, social_proof). Return ONLY JSON array of 4:
{ angle, hook(≤7 words), primary_text(PAS/4U), headline, cta, visual }.
MODE B (read-only): pull 7d metrics (spend,ROAS,CTR,CPC,CPM,CPA,frequency); classify
WINNER(scale)/OK(watch)/LOSER(pause: ROAS<breakeven OR freq>3); concrete recommendations.
SAFETY: money actions (publish/scale) require manual approval in UI; default read-only; never +budget >30% without reconfirm.
```

## content-drop (orchestrator)
```markdown
---
name: content-drop
description: One-action content pack. Chains content-brief → copywriting → humanize → ads-generate.
---
# Content Drop Orchestrator
1. Ambil produk (nama, colorway, harga, SKU, assets)
2. content-brief (semua format) → 3. copywriting → 4. humanize semua → 5. ads-generate (4 variant)
6. Rangkum jadi 1 Content Pack (brief + copy + ads + publish checklist).
Rules: konfirmasi data produk dulu (hindari halu); output 1 dokumen rapi buat UI + export.
```

> Revenue & Social bukan skill LLM — itu modul data (Ginee / IG / TikTok) di NestJS. LLM opsional cuma buat narasi anomali.

---

# Appendix B — Brand Profile

### Template
```yaml
brand_name:
industry:
audience:
voice_tone: { adjectives:, do:, dont: }
platforms:
output_language:
visual_assets:
usp:
cta_destinations:
constraints:
```

### SNKRS Flash (seed default)
```yaml
brand_name: SNKRS Flash (SneakersFlash)
industry: Sneaker e-commerce / resale (Indonesia)
audience: Sneakerhead & hypebeast Indonesia 17–30; ngejar hype, scarcity, value
voice_tone:
  adjectives: hype, bold, percaya diri, informal
  do: slang sneaker secukupnya (gercep, cop, amanin, limited); sneaker jadi hero
  dont: slang cringe/maksa; over-claim; bahasa kaku/formal
platforms: Instagram, TikTok
output_language: Bahasa Indonesia (informal) + istilah English sneaker umum
visual_assets: 4 angle produk — lateral, medial, pair, sole (pipeline image v15)
usp: Katalog autentik, drop & restock cepat, harga kompetitif
cta_destinations: Shopee Mall, TikTok Shop, sneakersflash.com
constraints: no over-claim; max 1 emoji /1–2 baris; jangan spam hashtag
```

---

# Appendix C — CLAUDE.md (taruh di root repo)

```markdown
# SNKRS Console

Web Ops Console (Next.js + NestJS + OpenClaw). Baca `MASTER-BRIEF.md` sebagai source of truth.

## Struktur
- api/  → NestJS (owns Prisma). Module per fitur: creative, ads, social, revenue, brand-profile, openclaw, auth.
- web/  → Next.js App Router.
- openclaw/ → skills (SKILL.md) + config.

## Aturan
- Skill generatif via OpenClaw Gateway, JANGAN hardcode prompt di backend.
- UI gak pernah akses OpenClaw/Ginee/DB langsung — selalu lewat NestJS.
- Secrets di env; jangan commit; jangan ke frontend.
- Ads write action wajib approval manual.
- Revenue via Ginee, skip order cancelled.
- Bangun Fase 1 → 2 → 3. Commit kecil per task.

## Command
- Dev: `docker compose up -d`
- Migrate: otomatis (api CMD) atau `npx prisma migrate dev` di api/
- Lint/build sebelum commit.
```
