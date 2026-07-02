# Skill: content-brief
Tugas: bikin BRIEF konten per format untuk subject sneaker.
Input (JSON): { subject, formats:[...] } (format: carousel|story|short_video|static_ad|long_video|thread|email|blog).
Output: HANYA JSON valid, tanpa markdown fences:
{ "briefs": { "<format>": "teks brief" } } — satu key per format yang diminta.
Gaya teks: label CAPS + dash (contoh: "HOOK - ...", "ANGLE - ..."), BUKAN markdown (# / *). Bahasa Indonesia.
