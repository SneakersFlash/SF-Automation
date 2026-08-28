# Skripsi — Proposal

Berkas proposal skripsi penulis. **Terpisah dari kode aplikasi**; tidak ada modul di
`api/` atau `web/` yang membacanya.

Acuan: **Panduan Proposal Skripsi Prodi Sistem Informasi S-1, Fakultas Ilmu Komputer,
Universitas Pamulang, Ver. 3.0 (2024)** — berlaku sejak Semester Ganjil TA 2024/2025.
Pedoman ini hanya mengatur **proposal (BAB I–III)**; aturan BAB IV–V tidak ada di dalamnya.

Judul:

> Otomasi Produksi Konten Pemasaran Berbasis *Multi-Agent* AI untuk Meningkatkan
> Efisiensi dan Konsistensi *Brand Voice* (Studi Kasus: SneakersFlash)

## Isi

| Berkas | Keterangan |
|---|---|
| `bab-1-pendahuluan.md` | **Sumber tunggal.** Sunting yang ini. |
| `bab-1-pendahuluan.docx` | Hasil rakitan, format sudah sesuai pedoman. Jangan disunting langsung — akan tertimpa. |
| `build_docx.py` | Perakit `.md` → `.docx`. Stdlib saja, tanpa dependensi. |

## Merakit ulang

```bash
cd skripsi
python3 build_docx.py bab-1-pendahuluan.md
```

Mesin ini tidak punya pandoc, libreoffice, maupun python-docx, jadi `build_docx.py`
merakit `.docx` langsung sebagai arsip ZIP berisi OOXML.

## Memverifikasi format

```bash
python3 ~/.claude/skills/skripsi-unpam-si/scripts/cek_format_docx.py \
        skripsi/bab-1-pendahuluan.docx
```

Hasil terakhir: **LULUS 12, GAGAL 0** — A4, margin 4/3/3/3 cm, Times New Roman 12,
rata kiri-kanan, spasi 1,5, before/after 0 pt, judul bab TNR 14 kapital bold.

Yang **tidak** diperiksa script dan harus dicek manual di Word: posisi nomor halaman,
penomoran Romawi kecil bagian awal, jarak antar-judul, indentasi alinea, dan cetak miring
kata asing.

## Yang masih terbuka

Tiga penanda di dalam naskah wajib diisi sebelum diserahkan ke pembimbing:

- `[SITASI DIBUTUHKAN: ...]` — dua tempat di 1.1. **Tidak ada sitasi yang dikarang.**
  Isi dengan sumber nyata yang sudah diverifikasi; jurnal maksimal 5 tahun terakhir.
- `[ANGKA DARI DATA PENELITI: ...]` — satu tempat di 1.1, untuk durasi penyiapan konten
  sebelum sistem diterapkan.

Belum dikerjakan: BAB II, BAB III, Daftar Pustaka, dan Bagian Awal (Halaman Judul,
Daftar Isi, Daftar Gambar, Daftar Tabel).

Empat keputusan yang masih menahan BAB III: metode pengembangan sistem, bentuk dan jumlah
data sebelum-sesudah, jumlah serta asal penilai rubrik, dan jadwal penelitian.

## Catatan

Sub-bab dan urutannya mengikuti pedoman dan **tidak boleh diubah** tanpa persetujuan
dosen pembimbing. Judul sub-bab dibuat tebal — pedoman tidak mewajibkannya, tetapi itu
praktik lazim; ubah bila pembimbing meminta lain.
