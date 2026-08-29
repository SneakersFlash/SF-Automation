# Skripsi — Proposal

Berkas proposal skripsi penulis. **Terpisah dari kode aplikasi**; tidak ada modul di
`api/` atau `web/` yang membacanya.

Acuan: **Panduan Proposal Skripsi Prodi Sistem Informasi S-1, Fakultas Ilmu Komputer,
Universitas Pamulang, Ver. 3.0 (2024)** — berlaku sejak Semester Ganjil TA 2024/2025.
Pedoman ini hanya mengatur **proposal (BAB I–III)**; aturan BAB IV–V tidak ada di dalamnya.

Judul:

> Perancangan Sistem Otomasi Produksi Konten Pemasaran Berbasis *Multi-Agent* AI
> untuk Meningkatkan Efisiensi dan Konsistensi *Brand Voice*
> (Studi Kasus: SneakersFlash)

## Isi

| Berkas | Keterangan |
|---|---|
| `bab-1-pendahuluan.md` | **Sumber tunggal** BAB I. Sunting yang ini. |
| `bab-2-tinjauan-pustaka.md` | **Sumber tunggal** BAB II. |
| `bab-3-metode-penelitian.md` | **Sumber tunggal** BAB III. |
| `proposal-skripsi-lengkap.docx` | **Berkas yang diserahkan.** Halaman Judul + Daftar Isi/Gambar/Tabel + BAB I–III + Daftar Pustaka. |
| `proposal-skripsi-bab-1-3.docx` | Gabungan tanpa bagian awal. Berguna kalau bagian awal dibuat sendiri di Word. |
| `daftar-gambar-tabel.md` | Keterangan gambar dan tabel. Sunting di sini kalau judulnya berubah. |
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
python3 build_docx.py bab-3-metode-penelitian.md

# dokumen gabungan (ganti halaman antar-bab + Daftar Pustaka)
python3 build_docx.py bab-1-pendahuluan.md bab-2-tinjauan-pustaka.md \
        bab-3-metode-penelitian.md --pustaka daftar-pustaka.md \
        -o proposal-skripsi-bab-1-3.docx

# berkas lengkap berikut bagian awal
python3 build_docx.py bab-1-pendahuluan.md bab-2-tinjauan-pustaka.md \
        bab-3-metode-penelitian.md \
        --pustaka daftar-pustaka.md --label daftar-gambar-tabel.md \
        --judul "Perancangan Sistem Otomasi Produksi Konten Pemasaran Berbasis \
Multi-Agent AI untuk Meningkatkan Efisiensi dan Konsistensi Brand Voice \
(Studi Kasus: SneakersFlash)" \
        --nama "Muhammad Faizal Triasa" --nim 231011701215 --tahun 2026 \
        -o proposal-skripsi-lengkap.docx
```

## Dua hal yang tetap manual di Word

Perakit tidak dapat menyisipkan gambar maupun mengatur penomoran halaman:

1. **Logo Universitas Pamulang 4 cm x 4 cm** pada halaman judul. Tempatnya sudah
   ditandai. Logo dapat diambil dari `skripsi .docx` yang diunggah sebelumnya.
2. **Nomor halaman** — Romawi kecil untuk bagian awal, angka untuk bagian inti,
   kanan atas kecuali halaman awal bab yang di tengah bawah.

Setelah penomoran diatur, isi nomor halaman pada Daftar Isi, Daftar Gambar, dan
Daftar Tabel. Titik penuntun sudah dipasang sebagai tab rata kanan, jadi angka
yang diketik langsung menempel rapi di tepi kanan.

Mesin ini tidak punya pandoc, libreoffice, maupun python-docx, jadi `build_docx.py`
merakit `.docx` langsung sebagai arsip ZIP berisi OOXML.

## Memverifikasi format

```bash
S=~/.claude/skills/skripsi-unpam-si/scripts
python3 $S/cek_format_docx.py skripsi/bab-1-pendahuluan.docx
python3 $S/cek_format_docx.py skripsi/bab-2-tinjauan-pustaka.docx
python3 $S/cek_format_docx.py skripsi/bab-3-metode-penelitian.docx
python3 $S/cek_format_docx.py skripsi/proposal-skripsi-bab-1-3.docx
python3 $S/cek_pustaka.py skripsi/daftar-pustaka.md --tahun 2026 \
        --teks skripsi/bab-1-pendahuluan.md \
        --teks skripsi/bab-2-tinjauan-pustaka.md \
        --teks skripsi/bab-3-metode-penelitian.md
```

Hasil terakhir: **ketiga bab dan dokumen gabungan sama-sama LULUS 12, GAGAL 0** — A4, margin 4/3/3/3 cm,
Times New Roman 12, rata kiri-kanan, spasi 1,5, before/after 0 pt, judul bab TNR 14 kapital
bold. Paragraf di dalam tabel dikecualikan karena pedoman memang mengecualikan tabel dari
aturan spasi 1,5.

Audit daftar pustaka: **8 entri, 0 temuan** — seluruhnya terbitan 2025, urutan alfabetis
benar, tidak ada entri ganda, tidak ada yang melewati batas usia. Pemeriksaan silang
teks terhadap daftar pustaka juga bersih dua arah: tidak ada sitasi yang menggantung,
dan tidak ada entri yang tidak pernah disitasi.

**Gaya APA yang diterapkan.** Daftar pustaka memakai indensi gantung 0,5 inci, judul
artikel *sentence case*, nama jurnal dan nomor volume dicetak miring, nomor terbitan
dalam kurung tidak miring, dan entri berakhir DOI/URL tidak diberi titik. Sitasi dalam
teks memakai bentuk naratif (`Tran dkk. (2025)`) dan bentuk kurung (`(Tran dkk., 2025)`).
Singkatan `dkk.` dipakai sebagai padanan *et al.* karena naskah berbahasa Indonesia —
ganti bila dosen pembimbing meminta *et al.*

Entri daftar pustaka dirata kiri-kanan karena pedoman menuntut *justify* dan tidak
mengecualikan daftar pustaka, meskipun APA sendiri lazimnya rata kiri.

Yang **tidak** diperiksa script dan harus dicek manual di Word: posisi nomor halaman,
penomoran Romawi kecil bagian awal, jarak antar-judul, indentasi alinea, dan cetak miring
kata asing.

## Yang masih terbuka

Tiga penanda di dalam naskah wajib diisi sebelum diserahkan ke pembimbing:

- `[SITASI DIBUTUHKAN: ...]` — dua tempat di 1.1. **Tidak ada sitasi yang dikarang.**
  Isi dengan sumber nyata yang sudah diverifikasi; jurnal maksimal 5 tahun terakhir.
- `[ANGKA DARI DATA PENELITI: ...]` — satu tempat di 1.1, untuk durasi penyiapan konten
  sebelum sistem diterapkan.

Pada BAB II terdapat `[SITASI DIBUTUHKAN: ...]` di enam sub-sub-bab Landasan Teori dan satu
`[CATATAN UNTUK PENULIS]` di 2.1.

**Status rujukan.** Delapan sumber pada `daftar-pustaka.md` sudah diverifikasi langsung ke
halaman penerbit, bukan dikutip dari hasil pencarian. Enam di antaranya melalui telaah
sejawat (EMNLP 2025, IEEE ICEBE 2025, dan empat jurnal Indonesia ber-DOI); **dua sisanya —
Tran dkk. dan Aghaei dkk. — berstatus *preprint* arXiv, bukan jurnal.** Pedoman menuntut
rujukan berupa jurnal, jadi pertimbangkan menggantinya atau meminta persetujuan pembimbing.

Penelitian terdahulu kini berjumlah **8**, sudah memenuhi praktik lazim 8–10 sumber.

**Metode pengembangan sistem: RAD** (*Rapid Application Development*), bukan Waterfall.
Dipilih karena riwayat commit menunjukkan putaran umpan balik yang nyata — `api/src`
disentuh 92 kali, rasio `fix` terhadap `feat` 10:14, dan `loadBrandContext()` ditambahkan
setelah sistem sudah tayang karena keluarannya dinilai generik. Rentang pengerjaan
1 Juli – 29 Agustus 2026 (60 hari) juga cocok dengan siklus pendek RAD.

Catatan verifikasi: jurnal Promedia menuliskan nama penulis yang berbeda pada blok
sitasi bawaannya ("Yudianto, Ferdi") dibanding *byline* artikelnya (Rahman, Choirunnisa,
Putra). Daftar pustaka di sini memakai nama pada *byline*. Konfirmasikan bila ragu.

Pada BAB III terdapat tiga penanda: dua `[BUTUH KEPUTUSAN PENULIS]` di 3.2.3 (jumlah
naskah uji, jumlah dan asal penilai, bentuk data sebelum-sesudah), satu di 3.4 (jadwal
masih usulan lima bulan), dan satu `[CATATAN UNTUK PENULIS]` di 3.2.4 (dimensi rubrik
diturunkan dari struktur profil merek, belum dari pustaka).

**Gambar yang harus digambar sendiri** — naskah sudah merujuknya, berkasnya belum ada:

| Gambar | Isi | Sub-bab |
|---|---|---|
| 2.1 | Kerangka berpikir | 2.3 |
| 3.1 | *Activity diagram* sistem berjalan | 3.1.1. |
| 3.2 | Arsitektur sistem usulan | 3.1.3. |
| 3.3 | *Use case diagram* | 3.1.3. |
| 3.4 | *Entity relationship diagram* | 3.1.3. |
| 3.5 | Tahapan RAD | 3.3 |

Belum dikerjakan: Bagian Awal (Halaman Judul, Daftar Isi, Daftar Gambar, Daftar Tabel).

Empat keputusan yang masih menahan BAB III: metode pengembangan sistem, bentuk dan jumlah
data sebelum-sesudah, jumlah serta asal penilai rubrik, dan jadwal penelitian.

## Catatan

Sub-bab dan urutannya mengikuti pedoman dan **tidak boleh diubah** tanpa persetujuan
dosen pembimbing. Judul sub-bab dibuat tebal — pedoman tidak mewajibkannya, tetapi itu
praktik lazim; ubah bila pembimbing meminta lain.
