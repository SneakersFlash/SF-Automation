# DESIGN SYSTEM (DS)
## SNKRS Console — Content & Insights Ops Console

| Meta | Nilai |
|------|-------|
| Versi | 1.0 |
| Status | Baseline |
| Framework Rekomendasi | **Tailwind CSS** (sesuai stack Next.js + kontrol token penuh) |
| Tema | Dark (warm "shoebox") — default & satu-satunya untuk fase ini |

---

## Daftar Isi
1. Design Principles
2. UX Principles
3. Accessibility (WCAG 2.1)
4. Color System
5. Typography
6. Spacing
7. Grid System
8. Layout System
9. Iconography
10. Data Visualization
11. Design Tokens
12. Component Library
13. Responsive Rules
14. Interaction Rules
15. Validation Rules
16. Empty States
17. Error States
18. Loading States
19. Notification Patterns
20. Dashboard Standards

---

## 1. Design Principles

### 1.1 Prinsip Utama
1. **Drop Console** — terasa seperti tool backstage yang nyiapin hype: cepat, padat, percaya diri.
2. **Tool, bukan landing page** — kepadatan informasi & kecepatan aksi > dekorasi.
3. **Satu aksen kuat** — flash orange dipakai hemat (aktif, primary, angka kunci).
4. **Karakter sneaker** — motif hangtag/spec-tag & monospace data (SKU/harga).

### 1.2 Nilai Visual
Bold, warm-dark, fungsional, streetwear. Hindari look template generic (slate dashboard, cream+serif).

---

## 2. UX Principles

### 2.1 Prinsip UX Operasional
- Input sekali, pakai lintas panel (Brand Profile + Subject persisten).
- Feedback jelas tiap aksi (loading → success/error).
- Aksi berbahaya (ads spend) selalu di balik approval eksplisit.

### 2.2 Mental Model per Peran
- **Owner**: kontrol + approval + setup.
- **Member**: produksi cepat, tanpa keputusan berbayar.

---

## 3. Accessibility — WCAG 2.1

### 3.1 Target Konformitas
WCAG 2.1 **AA**.

### 3.2 Kontras Warna
- Teks utama `--paper` di atas `--ink-900`/`--ink-800` ≥ 4.5:1.
- Teks sekunder `--paper-dim` ≥ 4.5:1 untuk body, ≥ 3:1 untuk teks besar.
- `--flash` hanya untuk elemen non-teks kecil / teks besar; hindari teks kecil oranye di atas gelap bila < 4.5:1.

### 3.3 Checklist
- Focus ring terlihat (`--flash-soft`) pada semua elemen interaktif.
- Target tap ≥ 44px.
- `prefers-reduced-motion` dihormati.
- Label form eksplisit; error terhubung `aria-describedby`.
- Semua ikon fungsional punya `aria-label`.

---

## 4. Color System

### 4.1 Filosofi Warna
Warm cardboard-dark (bayangan shoebox) + kertas off-white + satu aksen "flash orange" (nyambung nama brand). Semantik (up/down/watch) hanya untuk data.

### 4.2 Base / Neutral (Dark)
| Token | Nama | Hex | Penggunaan |
|-------|------|-----|-----------|
| ink-900 | Base BG | #14110B | Background utama |
| ink-800 | Panel | #1E1A12 | Surface/panel |
| ink-700 | Card/Tag | #2A241A | Card & spec tag |
| line | Border | #3A3122 | Border hairline |
| paper | Ink | #F3ECDD | Teks utama |
| paper-dim | Ink Muted | #B4A88C | Teks sekunder |
| paper-faint | Faint | #796E58 | Label faint/placeholder |

### 4.3 Accent
| Token | Nama | Hex | Penggunaan |
|-------|------|-----|-----------|
| flash | Flash Orange | #FF5A1F | Primary CTA, active, angka kunci |
| flash-soft | Flash Soft | rgba(255,90,31,.14) | Focus ring, fill aktif, highlight |

### 4.4 Semantic (Data & Feedback)
| Token | Hex | Penggunaan |
|-------|-----|-----------|
| up | #6FCF97 | Naik / winner / success |
| down | #FF6B6B | Turun / loser / error |
| watch | #E0B341 | Netral / pending / warning |
| info | #7CB3FF | Info |

### 4.5 Status Chip
| Status | Text | Background |
|--------|------|-----------|
| done / winner | #6FCF97 | rgba(111,207,151,.12) |
| pending / watch | #E0B341 | rgba(224,179,65,.12) |
| error / loser | #FF6B6B | rgba(255,107,107,.12) |
| processing | #7CB3FF | rgba(124,179,255,.12) |

---

## 5. Typography

### 5.1 Typeface
| Role | Font | Fallback |
|------|------|----------|
| Display | **Archivo** (800/900) | system-ui |
| Body/UI | **Inter** (400–600) | system-ui |
| Mono | **JetBrains Mono** (400–500) | monospace |

Archivo dipakai konsisten dengan homepage sneakersflash.com. Mono untuk SKU/harga/metadata (vibe tag/receipt).

### 5.2 Type Scale
| Token | Ukuran | Pakai |
|-------|--------|-------|
| text-xs | 0.75rem | mono-meta, label |
| text-sm | 0.8125rem | secondary |
| text-base | 0.9375rem | body |
| text-lg | 1.125rem | h2 |
| text-xl | 1.5rem | h1 |
| text-2xl | 2.0rem | display / angka besar |

### 5.3 Font Weight
Archivo 800/900 (display), Inter 400/500/600, Mono 400/500.

### 5.4 Aturan
- Header pakai Archivo, tracking ketat.
- Angka data & SKU/harga selalu Mono.
- Body Inter, line-height 1.5.

---

## 6. Spacing

### 6.1 Skala
| Token | Nilai |
|-------|-------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |

### 6.2 Aturan
- Padding panel 24px; card 16px.
- Gap antar OutputTag 16px.

---

## 7. Grid System

### 7.1 Grid Utama
12 kolom, gutter 24px.

### 7.2 Layout Dashboard
- Metric cards: grid 3–4 kolom (desktop), 1–2 (mobile).
- OutputTag: 1 kolom (fokus baca), Ads cards: 2×2 (desktop).

### 7.3 Max Width Container
Panel body max-width 1200px (konten), rail fixed ~240px.

---

## 8. Layout System

### 8.1 Shell Desktop
```
┌──────────┬───────────────────────────────┐
│  Rail    │  Topbar                        │
│  240px   │───────────────────────────────│
│          │  Active Tag (creative)         │
│          │  Panel body (max 1200)         │
└──────────┴───────────────────────────────┘
```

### 8.2 Shell Mobile
Rail → drawer (hamburger); topbar ringkas; Active Tag collapsible; konten full-width.

### 8.3 Layout Panel Kreatif
Controls (chips/toggle + Generate) di atas → Output (tag cards) di bawah.

### 8.4 Layout Dashboard (Insights)
Row metric cards → row visualisasi (bars/trend) → daftar/grid (top SKU / top posts).

---

## 9. Iconography

### 9.1 Library
**lucide-react** (garis, konsisten, ringan).

### 9.2 Ukuran
16px (inline), 20px (nav/button), 24px (header).

### 9.3 Pemetaan Ikon
| Fungsi | Ikon |
|--------|------|
| Content Brief | FileText |
| Copywriting | PenLine |
| Humanize | Sparkles |
| Ads | Megaphone |
| Social | BarChart3 |
| Revenue | TrendingUp |
| Brand Profile | Layers |
| Users | Users |
| Copy | Copy / Check |
| Loading | Loader2 (spin) |
| Anomali | AlertTriangle |

### 9.4 Aturan
Ikon fungsional wajib `aria-label`; ikon dekoratif `aria-hidden`.

---

## 10. Data Visualization

### 10.1 Library
Bar/trend ringan pakai CSS/div (konsisten tema) atau `recharts` bila perlu chart kompleks.

### 10.2 Tipe Chart per Konteks
| Konteks | Chart |
|---------|-------|
| Revenue per channel | Horizontal bars |
| Tren 7 hari revenue | Sparkline / mini bars |
| Follower growth | Trend bars |
| Ads classification | Table + status chip |

### 10.3 Palet Chart
Gunakan `--flash` untuk seri utama; `--up/--down` untuk delta; netral `--paper-dim` untuk baseline.

### 10.4 Standar
Selalu ada label + nilai; format rupiah ribuan; delta pakai warna semantik + panah.

---

## 11. Design Tokens

### 11.1 CSS Custom Properties
```css
:root {
  /* COLOR: BASE / NEUTRAL */
  --ink-900: #14110B;
  --ink-800: #1E1A12;
  --ink-700: #2A241A;
  --line:    #3A3122;
  --paper:       #F3ECDD;
  --paper-dim:   #B4A88C;
  --paper-faint: #796E58;

  /* COLOR: ACCENT */
  --flash:      #FF5A1F;
  --flash-soft: rgba(255,90,31,0.14);

  /* COLOR: SEMANTIC */
  --up:    #6FCF97;
  --down:  #FF6B6B;
  --watch: #E0B341;
  --info:  #7CB3FF;

  /* TYPOGRAPHY */
  --font-display: 'Archivo', system-ui, sans-serif;
  --font-sans:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --text-xs:   0.75rem;
  --text-sm:   0.8125rem;
  --text-base: 0.9375rem;
  --text-lg:   1.125rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;

  /* SPACING */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* RADIUS */
  --radius-input: 10px;
  --radius-chip:  10px;
  --radius-card:  14px;
  --radius-full:  9999px;

  /* BORDER & SHADOW */
  --border: 1px solid var(--line);
  --shadow-card: 0 1px 0 rgba(0,0,0,0.4);

  /* MOTION */
  --dur-fast: 120ms;
  --dur-base: 220ms;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 11.2 Tailwind Config (extend)
```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#14110B', 800: '#1E1A12', 700: '#2A241A' },
        line: '#3A3122',
        paper: { DEFAULT: '#F3ECDD', dim: '#B4A88C', faint: '#796E58' },
        flash: { DEFAULT: '#FF5A1F', soft: 'rgba(255,90,31,0.14)' },
        up: '#6FCF97', down: '#FF6B6B', watch: '#E0B341', info: '#7CB3FF',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { input: '10px', chip: '10px', card: '14px' },
      boxShadow: { card: '0 1px 0 rgba(0,0,0,0.4)' },
      transitionTimingFunction: { std: 'cubic-bezier(0.4,0,0.2,1)' },
    },
  },
  plugins: [],
};
```

---

## 12. Component Library

### 12.1 Button
| Varian | Style |
|--------|-------|
| Primary | bg `--flash`, teks `--ink-900`, radius chip; hover sedikit gelap |
| Secondary | transparan, border `--line`, teks `--paper`; hover border `--flash` |
| Ghost | tanpa border, teks `--paper-dim`; hover `--paper` |
| Danger | teks `--down`, border `--down` (untuk hapus) |
- State: default / hover / focus (ring `--flash-soft`) / disabled (opacity 50%) / loading (Loader2 spin + label).

### 12.2 Status Chip / Badge
Pill radius-full, teks + bg semantik (Section 4.5). Mono uppercase kecil.

### 12.3 Form Input
- bg `--ink-800`, border `--line`, radius input, teks `--paper`, placeholder `--paper-faint`.
- Focus: border `--flash`, ring `--flash-soft`.
- Error: border `--down` + pesan di bawah (teks `--down`).

### 12.4 Spec Tag (SIGNATURE)
Kartu output & Active Tag. Struktur:
```
┌───────────────────────────────────○──┐   ← punch hole kanan atas
│ MONO HEADER: brand · SKU · harga · drop │
│ ─ ─ ─ ─ ─ ─ (perforasi) ─ ─ ─ ─ ─ ─ ─ │
│ Isi konten                             │
│                              [ copy ]  │
└────────────────────────────────────────┘
```
- bg `--ink-700`, border `--line`, satu sudut "potong", punch hole (lingkaran `--ink-900`), tepi dashed sebagai perforasi.
- Header mono `--paper-dim`; isi `--paper`.

### 12.5 Metric Card
- bg `--ink-800`, border `--line`, radius card.
- Angka besar (Archivo/Mono), label kecil `--paper-dim`, delta (`--up`/`--down` + panah).

### 12.6 Data Table (Ads Performance)
- Header mono `--paper-faint`, row divider `--line`, status chip di kolom status.

### 12.7 Modal / Dialog (Approval)
- Overlay gelap; panel `--ink-800`; judul Archivo; tombol Approve (primary) + Batal (secondary).
- Tampilkan ringkasan rencana (budget/target) sebelum konfirmasi.

### 12.8 Rail Nav Item
- Default teks `--paper-dim`; aktif teks `--paper` + bar kiri `--flash`; hover bg `--ink-800`.

### 12.9 Brand Switcher
- Dropdown mono; item = brand_name; default ada badge "default".

### 12.10 Top Posts Grid
- Kartu thumbnail + overlay metric (reach · engagement) mono.

---

## 13. Responsive Rules

### 13.1 Breakpoint
| BP | Lebar | Perilaku |
|----|-------|----------|
| Desktop | ≥1024 | Rail tetap, grid penuh |
| Tablet | 640–1023 | Rail icon-only, grid 2 kolom |
| Mobile | <640 | Drawer, stack 1 kolom, tombol full-width |

### 13.2 Form Responsif
Field full-width di mobile; label di atas input.

### 13.3 Touch Target
≥44px semua elemen interaktif.

---

## 14. Interaction Rules

### 14.1 Durasi Animasi
- Fast 120ms (hover/focus), Base 220ms (panel/print-in).

### 14.2 Hover & Focus
- Hover tombol/tag: lift 1px + border `--flash`.
- Focus: ring `--flash-soft`.

### 14.3 Signature Motion — "Print-in"
Output tag muncul dengan slide-down + fade (seperti label keluar printer). Satu momen berkarakter; sisanya tenang. Dimatikan bila `prefers-reduced-motion`.

### 14.4 Confirmation Pattern
Aksi berbayar (ads) → modal ringkasan → tombol Approve. Tidak ada auto-execute.

---

## 15. Validation Rules
- Inline, real-time saat blur; pesan di bawah field (teks `--down`).
- Tombol Generate disabled bila input wajib kosong.
- Rupiah diformat saat blur (Rp 2.400.000).

---

## 16. Empty States
| Panel | Pesan |
|-------|-------|
| Content Brief | "Pilih format dulu, terus generate." |
| Humanize | "Tempel copy yang mau dibikin natural." |
| Social | "Connect akun IG/TikTok dulu." (arahkan ke Settings, Owner) |
| Revenue | "Belum ada data untuk tanggal ini." |
Empty state = ajakan aksi + (bila relevan) tombol menuju aksi, bukan kosong melompong.

---

## 17. Error States
- Pesan jelas + arah benerin + tombol retry. Contoh: *"Gagal nyambung ke skill. Cek backend, lalu coba lagi."*
- Tidak menampilkan stack trace ke user.
- Warna `--down`; ikon AlertTriangle.

---

## 18. Loading States
- Tombol → spinner (Loader2) + label ("Lagi nyusun brief…").
- OutputTag → skeleton "lagi diprint".
- Data panel → skeleton cards.

---

## 19. Notification Patterns
- In-app toast (sukses/gagal generation), auto-dismiss.
- Badge (ads perlu approval, anomali revenue).
- Tidak ada WA/Telegram/SMS.
- Toast: sukses `--up`, error `--down`, info `--info`.

---

## 20. Dashboard Standards
- Setiap metric card: nilai (besar) + label + delta (warna semantik + panah).
- Rupiah ribuan; persen 1 desimal.
- Highlight anomali dengan badge `--watch`/`--down`.
- Data selalu punya timestamp/tanggal sumber.

---

## Requirement Log
| Item | Referensi | Status |
|------|-----------|--------|
| Color system dark + flash | SRS Section 8.4 | Baseline |
| Tokens + Tailwind config | Section 11 | Baseline |
| Spec Tag signature | IA Content Hierarchy | Baseline |
| States (empty/error/loading) | SRS NFR 8.4 | Baseline |
| WCAG AA | Section 3 | Baseline |
