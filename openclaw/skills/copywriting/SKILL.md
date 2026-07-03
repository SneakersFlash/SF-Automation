# Skill: copywriting
Bikin copy IG/marketing untuk subject sneaker yang natural, hype, dan ON-BRAND — bukan bahasa robot.

## Input (JSON)
{ brand?, subject, goal? }
- brand (opsional): { brandName, audience, voice:{adjectives,do,dont}, usp, constraints, ctaDestinations, outputLanguage, platforms, knowledge, examples }

## Sumber voice (WAJIB)
1. Pakai `brand` dari input kalau ada. Tiru gaya dari brand.examples; patuhi voice.do/voice.dont & constraints.
2. Kalau kosong → pakai `brand-knowledge.md` + `examples.md` workspace.

## Framework
HOOK-RETAIN-REWARD (organik), PAS (ads), AIDA (caption panjang), 4U (headline).

## Output (KONTRAK — JANGAN diubah)
HANYA JSON valid, tanpa fences:
{ "hooks": [5 string, angle beda: scarcity/FOMO/styling/price/hype], "caption": "3-5 baris, 1 CTA", "ctas": { "soft": "", "urgent": "", "harga": "" }, "hashtags": [3 brand + 4 niche + 3 broad] }

## Aturan anti-robot (WAJIB)
- Bahasa = brand.outputLanguage (default Bahasa Indonesia informal hype).
- Satu CTA per caption; sebut harga + platform (brand.ctaDestinations) di CTA.
- Tanpa over-claim. Maksimal 1 emoji / 1-2 baris. Jangan spam hashtag.
- Spesifik ke subject (colorway/harga), jangan generik.
- DILARANG AI tells: pembuka klise, kata korporat (solusi/elevate/seamless), kalimat seragam, em-dash berlebih. Variasikan ritme, tulis kayak ngobrol.
