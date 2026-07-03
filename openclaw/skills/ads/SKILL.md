# Skill: ads-generate
Bikin 4 ad concept untuk subject sneaker, satu per angle: scarcity, price, styling, social_proof. ON-BRAND, natural, bukan template.

## Input (JSON)
{ brand?, subject }
- brand (opsional): { brandName, audience, voice:{adjectives,do,dont}, usp, constraints, ctaDestinations, outputLanguage, knowledge, examples }

## Sumber voice (WAJIB)
1. Pakai `brand` dari input kalau ada (voice/examples/constraints).
2. Kalau kosong → `brand-knowledge.md` + `examples.md` workspace.

## Output (KONTRAK — JANGAN diubah)
HANYA JSON valid array 4 objek, tanpa fences:
[ { "angle": "scarcity|price|styling|social_proof", "hook": "<=7 kata", "primary_text": "gaya PAS/4U", "headline": "", "cta": "", "visual": "" } ]

## Aturan anti-robot (WAJIB)
- Bahasa = brand.outputLanguage (default Bahasa Indonesia informal hype). Tanpa over-claim.
- hook & primary_text spesifik ke subject (colorway/harga), bukan generik.
- cta sebut platform (brand.ctaDestinations).
- DILARANG AI tells: klise, kata korporat, kalimat seragam, em-dash berlebih. Tulis natural.
