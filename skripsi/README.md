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
| `sidang-proposal.pptx` | **Slide sidang proposal.** 14 slide, 16:9. |
| `build_pptx.py` | Perakit slide. Isi slide ada pada daftar `SLIDE` di dalamnya. |
| `cek_pptx.py` | Pemeriksa paket `.pptx`: XML, rujukan, luapan teks. |
| `render_pptx.py` | Merender slide jadi PNG memakai PIL, untuk dilihat sebelum sidang. |

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

## Penomoran halaman

Sudah dirakit otomatis sesuai pedoman butir 3.4, jadi tidak perlu diatur manual:

- **Bagian awal** memakai angka Romawi kecil **di tengah bawah**. Halaman judul
  dihitung sebagai `i` tetapi nomornya tidak dicetak (mengikuti Contoh 3), sehingga
  Daftar Isi jatuh di `ii`, Daftar Gambar `iii`, Daftar Tabel `iv` — persis Contoh 4.
  Daftar Isi/Gambar/Tabel adalah judul setara bab, jadi halamannya masuk ketentuan
  "halaman bab baru" yang pedoman minta di tengah bawah.
- **Bagian inti dan akhir** memakai angka biasa, dimulai dari 1 di BAB I.
- **Posisi** nomor di kanan atas, kecuali halaman awal setiap bab yang di tengah
  bawah. Tiap bab jadi *section* tersendiri dengan `w:titlePg` supaya halaman
  pertamanya memakai aturan yang berbeda.

Nomor pada Daftar Isi, Daftar Gambar, dan Daftar Tabel diisi field `PAGEREF` yang
menunjuk penanda (*bookmark*) di naskah, jadi Word yang menghitung sendiri. Berkas
juga membawa `<w:updateFields>` supaya field disegarkan saat dibuka.

> Setelah menyisipkan gambar, tekan **Ctrl+A lalu F9** agar seluruh nomor dihitung
> ulang. Sebelum disegarkan, angka yang tampak hanyalah nilai cadangan.

**Jangan diperiksa lewat Google Docs.** Docs tidak menjalankan field `PAGEREF` dan
meratakan penomoran per-*section*, sehingga seluruh entri BAB tampak bernomor `1` dan
aturan Romawi/angka biasa hilang. Buka dengan Microsoft Word (desktop atau Word Online)
atau LibreOffice Writer — di LibreOffice, segarkan lewat Tools → Update → Update All.
Berkas serahannya memang `.docx`, jadi yang menentukan adalah tampilan di Word.

## Satu hal yang tetap manual di Word

**Logo Universitas Pamulang 4 cm x 4 cm** pada halaman judul. Tempatnya sudah
ditandai. Logo dapat diambil dari `skripsi .docx` yang diunggah sebelumnya.

Mesin ini tidak punya pandoc, libreoffice, maupun python-docx, jadi `build_docx.py`
merakit `.docx` langsung sebagai arsip ZIP berisi OOXML.

## Slide sidang

```bash
cd skripsi
python3 build_pptx.py -o sidang-proposal.pptx     # rakit ulang
python3 cek_pptx.py sidang-proposal.pptx          # periksa paket
mkdir -p /tmp/pratinjau
python3 render_pptx.py sidang-proposal.pptx /tmp/pratinjau   # lihat hasilnya
```

Isi tiap slide ditulis pada daftar `SLIDE` di dalam `build_pptx.py` — sunting di situ,
lalu rakit ulang. Jangan menyunting `.pptx` lalu merakit ulang; hasil suntingan akan
tertimpa.

Slide sengaja dibuat ringkas; uraiannya ada di **catatan pembicara** (12 dari 14 slide,
semua kecuali halaman judul dan penutup). Buka lewat View → Notes Page, atau Presenter
View saat sidang. Tulis di kunci `catatan` berupa daftar baris; kunci `nota` yang mirip
namanya dipakai untuk keterangan kaki tabel di badan slide, bukan catatan pembicara.

Lima slide menerangkan cara sistem bekerja — bagian yang tidak dapat dibaca dari naskah
karena diturunkan langsung dari kode: gerbang agen (satu model, empat ruang kerja), alur
satu permintaan, kunci anti-generik, alur generasi gambar, dan peta integrasi berikut
statusnya.

**Lingkup pada slide integrasi.** Batasan 1.4 butir c membatasi modul yang diteliti pada
ringkasan konten, penulisan naskah, dan penghalusan teks. Generasi gambar (kie.ai) dan
integrasi lokapasar serta media sosial **tidak** termasuk di dalamnya, jadi slide 10 dan
11 menandainya tegas sebagai bagian sistem, bukan bagian pengukuran. Kalau salah satunya
hendak ikut dinilai, batasan di naskah harus direvisi lebih dulu.

Nama produk sengaja tidak dipakai di badan slide (memakai *gerbang agen*, *layanan
gambar*, *lokapasar*) supaya sejajar dengan naskah; nama aslinya ada di catatan
pembicara.

Empat penanda `[ sisipkan ... ]` menunggu berkas gambar: logo Unpam pada halaman judul,
lalu Gambar 2.1, 3.1, 3.2, dan 3.5. Nama pembimbing pada halaman judul juga masih
berupa penanda.

`render_pptx.py` memakai DejaVu Sans karena mesin ini tidak punya Calibri. DejaVu lebih
lebar, jadi pratinjaunya pesimistis: yang muat di pratinjau pasti muat di PowerPoint.
Yang **tidak** dapat diperiksa di sini adalah apakah PowerPoint membuka berkasnya tanpa
keluhan — mesin ini tidak punya PowerPoint maupun LibreOffice. Buka sekali sebelum hari
sidang.

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

Hasil terakhir: **ketiga bab dan dokumen gabungan LULUS 17, GAGAL 0; berkas lengkap
LULUS 20, GAGAL 0** — A4, margin 4/3/3/3 cm, Times New Roman 12, rata kiri-kanan, spasi 1,5,
before/after 0 pt, judul bab TNR 14 kapital bold, plus penomoran halaman (Romawi kecil di
bagian awal di tengah bawah, angka biasa mulai 1 di BAB I, kanan atas kecuali halaman
awal bab yang di tengah bawah).
Paragraf di dalam tabel dikecualikan karena pedoman memang mengecualikan tabel dari
aturan spasi 1,5.

Audit daftar pustaka: **29 entri, 0 temuan** — urutan alfabetis benar, tidak ada entri
ganda, tidak ada yang melewati batas usia. Pemeriksaan silang
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

Yang **tidak** diperiksa script dan harus dicek manual di Word: jarak antar-judul,
indentasi alinea, dan cetak miring kata asing. Script memeriksa penomoran halaman lewat
`sectPr` dan isi header/footer, tetapi tidak merender halaman — angka yang sebenarnya baru
pasti setelah berkas dibuka dan field disegarkan.

## Yang masih terbuka

Dua penanda di dalam naskah, keduanya di BAB III, sengaja menunggu materi media sosial
penulis terkumpul:

- `[BUTUH KEPUTUSAN PENULIS]` di 3.2.3 — jumlah naskah yang diuji serta jumlah dan asal
  penilai. Penilai sekurang-kurangnya tiga orang; penilai dari luar tim lebih kuat menahan
  keberatan soal keberpihakan.
- `[CATATAN UNTUK PENULIS]` di 3.2.4 — dimensi rubrik konsistensi *brand voice* diturunkan
  dari struktur profil merek pada sistem, belum dari pustaka. Tinjau ulang setelah 2.2.4.

Penanda sitasi dan angka data peneliti di BAB I dan BAB II **sudah terisi semua.**

**Status rujukan.** `daftar-pustaka.md` berisi **29 entri**, seluruhnya diverifikasi langsung
ke halaman penerbit (Crossref, DOAJ, Google Books, OJS jurnal) — bukan dari cuplikan hasil
pencarian. Tidak ada blog pemasaran komersial. Penelitian terdahulu berjumlah **20 studi
berbeda**: 10 diuraikan sebagai paragraf naratif di 2.1 dan 10 lagi diringkas pada Tabel 2.1.

**Status sistem: prototipe, masih dalam pengujian — belum dipakai untuk operasional harian.**
`ai.sneakersflash.com` hanya lingkungan uji coba. Naskah ditulis dengan diksi *perancangan*,
bukan *pengembangan*, dan batasan masalah butir b menyatakan status ini secara eksplisit.

**Metode perancangan sistem: RAD** (*Rapid Application Development*), bukan Waterfall.
Dipilih karena riwayat commit menunjukkan putaran umpan balik yang nyata — `api/src`
disentuh 92 kali, rasio `fix` terhadap `feat` 10:14, dan `loadBrandContext()` ditambahkan
setelah keluaran prototipe dinilai generik. Rentang pengerjaan 1 Juli – 29 Agustus 2026
(60 hari) juga cocok dengan siklus pendek RAD.

Kata *pengembangan* masih tersisa di empat tempat dan **tidak boleh diubah**: judul 3.3
(dikunci Contoh 4 pedoman), judul 2.2.7 (sengaja sejajar dengan 3.3), definisi RAD yang
dikutip dari Yunus dkk. (2025), dan judul asli artikel Priyono dkk. (2025) pada Tabel 2.1.
Tiga yang terakhir adalah kutipan tulisan orang lain — mengubahnya berarti memalsukan sumber.

Catatan verifikasi: jurnal Promedia menuliskan nama penulis yang berbeda pada blok
sitasi bawaannya ("Yudianto, Ferdi") dibanding *byline* artikelnya (Rahman, Choirunnisa,
Putra). Daftar pustaka di sini memakai nama pada *byline*. Konfirmasikan bila ragu.

**Gambar yang harus digambar sendiri** — naskah sudah merujuknya, berkasnya belum ada:

| Gambar | Isi | Sub-bab |
|---|---|---|
| 2.1 | Kerangka berpikir | 2.3 |
| 3.1 | *Activity diagram* sistem berjalan | 3.1.1. |
| 3.2 | Arsitektur sistem usulan | 3.1.3. |
| 3.3 | *Use case diagram* | 3.1.3. |
| 3.4 | *Entity relationship diagram* | 3.1.3. |
| 3.5 | Tahapan RAD | 3.3 |

Bagian Awal (Halaman Judul, Daftar Isi, Daftar Gambar, Daftar Tabel) sudah dirakit,
berikut penomoran halamannya.

## Catatan

Sub-bab dan urutannya mengikuti pedoman dan **tidak boleh diubah** tanpa persetujuan
dosen pembimbing. Judul sub-bab dibuat tebal — pedoman tidak mewajibkannya, tetapi itu
praktik lazim; ubah bila pembimbing meminta lain.
