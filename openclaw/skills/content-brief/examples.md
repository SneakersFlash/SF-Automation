# Contoh output + anti-echo (content-brief)

## BAGUS — image (kind:visual)
{
  "contentType":"image","kind":"visual",
  "concept":"Panda diposisikan sebagai 'daily default' — sepatu yang bikin outfit apa pun langsung kelihatan rapi tanpa mikir.",
  "assets":[{"role":"hero","media":"image","image_prompt":"Nike Dunk Low Panda on a matte concrete pedestal, three-quarter angle, hard directional key light from the left with soft fill, black-and-white studio backdrop, subtle long shadow, shallow depth of field, 50mm lens, crisp leather texture, minimal editorial product photography","aspect_ratio":"4:5","text_overlay":"DAILY DEFAULT","negative_prompt":"distorted swoosh, extra laces, wrong colorway, watermark, text artifacts, deformed"}],
  "copy":{"caption":"Panda emang default yang jarang salah. Clean, gampang dipadu, dan stoknya cepet gerak.","cta":"Amanin di Shopee Mall.","hashtags":["#SNKRSFlash","#NikeDunk","#Panda","#sneakerhead","#dailykicks","#ootdmen","#restock","#sneakersID","#hypebeast","#kickstagram"],"headline":"","primary_text":""}
}

## BURUK — JANGAN (echo knowledge mentah / template)
{ "concept":"Drop tiap Jumat 19.00 WIB. Sebut sneaker sebagai hero." }
-> ini cuma menyalin kalimat knowledge. `concept` harus angle baru, bukan copy-paste fakta.
{ "image_prompt":"a nice photo of the shoes on a background" }
-> terlalu generik. Wajib spesifik: lighting, komposisi, lens, palette, mood.

## Larangan
- Jangan menyalin kalimat dari brand.knowledge / brand.examples ke output.
- Jangan bikin image_prompt generik. Selalu konkret dan sinematik.
- feeds9 wajib TEPAT 9 asset dengan tema visual konsisten.
