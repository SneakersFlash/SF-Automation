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
| `bab-1-pendahuluan.md` | **Sumber tunggal** BAB I. Sunting yang ini. |
| `bab-2-tinjauan-pustaka.md` | **Sumber tunggal** BAB II. |
| `daftar-pustaka.md` | Rujukan terverifikasi, gaya APA. Tumbuh seiring bab bertambah. |
| `*.docx` | Hasil rakitan, format sudah sesuai pedoman. Jangan disunting langsung — akan tertimpa. |
| `build_docx.py` | Perakit `.md` → `.docx`. Stdlib saja, tanpa dependensi. |

Subset Markdown yang dikenali perakit: `# BAB I ...` (judul bab, dipecah dua baris),
`## 1.1 ...` (sub-bab), `### 2.2.1. ...` (sub-sub-bab), `a. ...` (butir daftar),
`| a | b |` (tabel), `*miring*`, dan `[PENANDA]` yang ditebalkan.

## Merakit ulang

```bash
cd skripsi
python3 build_docx.py bab-1-pendahuluan.md
python3 build_docx.py bab-2-tinjauan-pustaka.md
```

Mesin ini tidak punya pandoc, libreoffice, maupun python-docx, jadi `build_docx.py`
merakit `.docx` langsung sebagai arsip ZIP berisi OOXML.

## Memverifikasi format

```bash
S=~/.claude/skills/skripsi-unpam-si/scripts
python3 $S/cek_format_docx.py skripsi/bab-1-pendahuluan.docx
python3 $S/cek_format_docx.py skripsi/bab-2-tinjauan-pustaka.docx
python3 $S/cek_pustaka.py     skripsi/daftar-pustaka.md --tahun 2026
```

Hasil terakhir: **BAB I dan BAB II sama-sama LULUS 12, GAGAL 0** — A4, margin 4/3/3/3 cm,
Times New Roman 12, rata kiri-kanan, spasi 1,5, before/after 0 pt, judul bab TNR 14 kapital
bold. Paragraf di dalam tabel dikecualikan karena pedoman memang mengecualikan tabel dari
aturan spasi 1,5.

Audit daftar pustaka: 6 entri, seluruhnya terbitan 2025, tidak ada yang melewati batas usia.

Yang **tidak** diperiksa script dan harus dicek manual di Word: posisi nomor halaman,
penomoran Romawi kecil bagian awal, jarak antar-judul, indentasi alinea, dan cetak miring
kata asing.

## Yang masih terbuka

Tiga penanda di dalam naskah wajib diisi sebelum diserahkan ke pembimbing:

- `[SITASI DIBUTUHKAN: ...]` — dua tempat di 1.1. **Tidak ada sitasi yang dikarang.**
  Isi dengan sumber nyata yang sudah diverifikasi; jurnal maksimal 5 tahun terakhir.
- `[ANGKA DARI DATA PENELITI: ...]` — satu tempat di 1.1, untuk durasi penyiapan konten
  sebelum sistem diterapkan.

Pada BAB II terdapat `[SITASI DIBUTUHKAN: ...]` di tujuh sub-sub-bab Landasan Teori dan satu
`[CATATAN UNTUK PENULIS]` di 2.1.

**Status rujukan.** Enam sumber pada `daftar-pustaka.md` sudah diverifikasi langsung ke
halaman penerbit, bukan dikutip dari hasil pencarian. Empat di antaranya melalui telaah
sejawat (EMNLP 2025, IEEE ICEBE 2025, dan dua jurnal Indonesia); **dua sisanya —
Tran dkk. dan Aghaei dkk. — berstatus *preprint* arXiv, bukan jurnal.** Pedoman menuntut
rujukan berupa jurnal, jadi pertimbangkan menggantinya atau meminta persetujuan pembimbing.

Praktik lazim menuntut 8–10 penelitian terdahulu; baru ada 6. Perlu 2–4 sumber tambahan.

Catatan verifikasi: jurnal Promedia menuliskan nama penulis yang berbeda pada blok
sitasi bawaannya ("Yudianto, Ferdi") dibanding *byline* artikelnya (Rahman, Choirunnisa,
Putra). Daftar pustaka di sini memakai nama pada *byline*. Konfirmasikan bila ragu.

Belum dikerjakan: BAB III dan Bagian Awal (Halaman Judul, Daftar Isi, Daftar Gambar,
Daftar Tabel).

Empat keputusan yang masih menahan BAB III: metode pengembangan sistem, bentuk dan jumlah
data sebelum-sesudah, jumlah serta asal penilai rubrik, dan jadwal penelitian.

## Catatan

Sub-bab dan urutannya mengikuti pedoman dan **tidak boleh diubah** tanpa persetujuan
dosen pembimbing. Judul sub-bab dibuat tebal — pedoman tidak mewajibkannya, tetapi itu
praktik lazim; ubah bila pembimbing meminta lain.
