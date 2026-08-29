# BAB II TINJAUAN PUSTAKA

## 2.1 Penelitian Terdahulu

Penelusuran penelitian terdahulu dilakukan pada basis data Scopus, arXiv, Garuda, dan Google Scholar. Kata kunci yang digunakan meliputi *multi-agent large language model*, *content generation*, *marketing content automation*, *brand voice consistency*, serta padanannya dalam bahasa Indonesia yaitu otomasi konten pemasaran, kecerdasan buatan generatif, dan rancang bangun sistem informasi. Kriteria inklusi yang ditetapkan adalah publikasi terbitan tahun 2021 sampai 2026, berbahasa Indonesia atau Inggris, dan membahas penerapan model bahasa besar pada produksi konten atau pemasaran. Dari penelusuran tersebut diperoleh enam penelitian yang relevan sebagaimana disajikan pada Tabel 2.1.

| Penulis dan Tahun | Judul | Metode | Hasil | Perbedaan dengan Penelitian Ini |
| --- | --- | --- | --- | --- |
| Tran dkk. (2025) | Multi-Agent Collaboration Mechanisms: A Survey of LLMs | Kajian pustaka | Menyusun kerangka dimensi kolaborasi antar-agen: aktor, jenis interaksi, struktur, strategi, dan protokol koordinasi | Bersifat konseptual dan tidak membangun sistem pada kasus bisnis nyata |
| Lin dkk. (2025) | Creativity in LLM-based Multi-Agent Systems: A Survey | Kajian pustaka | Menyusun taksonomi proaktivitas agen dan desain persona serta teknik penghasilan luaran kreatif | Fokus pada kreativitas luaran, tidak mengukur konsistensi identitas merek |
| Chu dkk. (2025) | LLM-Based Multi-Agent System for Simulating and Analyzing Marketing and Consumer Behavior | Simulasi berbasis agen | Agen generatif mampu berinteraksi dan mengambil keputusan pembelian untuk menguji strategi pemasaran | Mensimulasikan perilaku konsumen, bukan memproduksi materi konten |
| Aghaei dkk. (2025) | Harnessing the Potential of Large Language Models in Modern Marketing Management | Kajian konseptual | Memetakan penerapan model bahasa besar pada keterlibatan pelanggan, optimasi kampanye, dan penghasilan konten | Tidak membangun maupun menguji sistem, dan tidak mengukur efisiensi |
| Rahman dkk. (2025) | Penggunaan Large Language Models dalam Penulisan Artikel Berita | Systematic Literature Review dengan protokol PRISMA | Menemukan risiko halusinasi dan bias algoritmik, serta perlunya keseimbangan peran manusia dan mesin | Konteks jurnalisme, bukan konten pemasaran, dan tidak menghasilkan artefak sistem |
| Yusna dkk. (2025) | Rancang Bangun Sistem Informasi Manajemen Proyek Berbasis Web pada Apada Studio Menggunakan Metode Waterfall | Waterfall dengan pengujian black box | Seluruh fungsi sistem dinyatakan valid melalui pengujian black box | Tidak melibatkan kecerdasan buatan dan hanya menguji fungsionalitas, bukan mutu luaran |

Berdasarkan Tabel 2.1 dapat disimpulkan beberapa hal. Penelitian Tran dkk. (2025) dan Lin dkk. (2025) telah memetakan mekanisme kolaborasi serta kreativitas pada sistem *multi-agent* berbasis model bahasa besar, namun keduanya berhenti pada tataran konseptual dan tidak menerapkannya pada proses bisnis yang berjalan. Chu dkk. (2025) telah membawa pendekatan *multi-agent* ke ranah pemasaran, tetapi agen digunakan untuk mensimulasikan perilaku konsumen, bukan untuk memproduksi materi konten. Aghaei dkk. (2025) memetakan peluang penerapan model bahasa besar pada manajemen pemasaran secara luas tanpa membangun sistem maupun mengukur dampaknya. Pada konteks Indonesia, Rahman dkk. (2025) menyoroti risiko halusinasi dan bias pada luaran model bahasa besar serta menekankan perlunya kendali manusia, namun kajian tersebut berada pada domain jurnalisme. Sementara itu Yusna dkk. (2025) mewakili corak penelitian rancang bangun sistem informasi yang lazim di Indonesia, yang menguji sistem hanya sampai kesesuaian fungsi melalui *black box* tanpa menilai mutu luaran yang dihasilkan.

Dengan demikian terdapat celah riset yang belum terisi. Belum ditemukan penelitian yang sekaligus membangun sistem produksi konten pemasaran yang benar-benar dioperasikan, menerapkan arsitektur *multi-agent* dengan pembagian tugas per modul, menggunakan profil merek terstruktur sebagai konteks untuk menjaga konsistensi *brand voice*, serta mengukur dampaknya pada dua sisi sekaligus yaitu efisiensi waktu dan konsistensi identitas merek dalam konteks ritel berbahasa Indonesia. Celah inilah yang hendak diisi oleh penelitian ini.

[CATATAN UNTUK PENULIS: enam sumber di atas sudah diverifikasi keberadaannya. Praktik lazim menuntut delapan sampai sepuluh penelitian terdahulu, sehingga masih dibutuhkan dua sampai empat sumber tambahan. Perluas penelusuran pada Garuda dan SINTA dengan kata kunci: evaluasi luaran model bahasa besar bahasa Indonesia, sistem informasi pemasaran berbasis kecerdasan buatan, dan konsistensi gaya bahasa merek.]

## 2.2 Landasan Teori

### 2.2.1. Produksi Konten Pemasaran Digital

[SITASI DIBUTUHKAN: definisi pemasaran konten digital dan tahapan produksinya, dari buku terbitan maksimal sepuluh tahun terakhir atau jurnal maksimal lima tahun terakhir]

### 2.2.2. Kecerdasan Buatan Generatif dan Model Bahasa Besar

Model bahasa besar atau *large language model* merupakan model kecerdasan buatan generatif yang dilatih pada korpus teks berskala besar sehingga mampu menghasilkan teks baru menyerupai tulisan manusia. Aghaei dkk. (2025) memetakan penerapan model bahasa besar pada manajemen pemasaran modern, mencakup keterlibatan pelanggan, optimasi kampanye, dan penghasilan konten, sekaligus menyoroti persoalan privasi data, transparansi, dan mitigasi bias.

Penerapan model bahasa besar pada penulisan tidak lepas dari risiko. Rahman dkk. (2025), melalui kajian pustaka sistematis berprotokol PRISMA terhadap delapan artikel terpilih dari 339 dokumen awal, menemukan bahwa penggunaan model bahasa besar pada penulisan artikel berita menghadirkan ketegangan mendasar antara tuntutan efisiensi produksi dan kewajiban menjaga integritas, dengan risiko utama berupa halusinasi kecerdasan buatan dan bias algoritmik. Temuan tersebut menjadi dasar bagi penelitian ini untuk tetap menempatkan manusia sebagai pemeriksa akhir dan mencatat setiap luaran yang dihasilkan sistem.

### 2.2.3. Agen Cerdas dan Sistem Multi-Agent

Sistem *multi-agent* berbasis model bahasa besar adalah sistem yang menempatkan beberapa agen kecerdasan buatan untuk berkoordinasi menyelesaikan tugas yang kompleks secara kolektif. Tran dkk. (2025) menyusun kerangka yang mencirikan mekanisme kolaborasi tersebut berdasarkan sejumlah dimensi, yaitu aktor yang terlibat, jenis interaksi, struktur organisasi, strategi, dan protokol koordinasi. Kerangka ini menjadi acuan dalam merancang pembagian tugas antar-agen pada penelitian ini.

Pada ranah penghasilan luaran kreatif, Lin dkk. (2025) menyusun taksonomi proaktivitas agen dan desain persona, serta memetakan teknik penghasilan luaran melalui eksplorasi divergen, penyempurnaan iteratif, dan sintesis kolaboratif. Konsep desain persona tersebut sejalan dengan penggunaan profil merek sebagai konteks pada penelitian ini.

Penerapan pendekatan *multi-agent* pada ranah pemasaran telah ditunjukkan Chu dkk. (2025) yang membangun kerangka simulasi agar agen generatif dapat berinteraksi, menyatakan penalaran internal, membentuk kebiasaan, dan mengambil keputusan pembelian, sehingga strategi pemasaran dapat diuji sebelum diterapkan. Perbedaannya, penelitian ini menggunakan agen untuk memproduksi materi konten, bukan untuk mensimulasikan konsumen.

### 2.2.4. Brand Voice dan Konsistensi Identitas Merek

[SITASI DIBUTUHKAN: definisi *brand voice* serta dimensi pengukurannya. Penelusuran pada tahap ini belum menemukan sumber akademik yang layak; hasil pencarian didominasi tulisan pemasaran komersial yang tidak melalui telaah sejawat sehingga tidak dapat dipakai. Cari pada jurnal manajemen pemasaran atau buku *branding* terbitan maksimal sepuluh tahun terakhir]

### 2.2.5. Otomasi Alur Kerja dan Antrian Tugas

[SITASI DIBUTUHKAN: konsep *workflow automation* dan antrian tugas asinkron pada aplikasi web]

### 2.2.6. Arsitektur Aplikasi Web dan REST API

[SITASI DIBUTUHKAN: arsitektur klien-server dan prinsip REST API]

### 2.2.7. Metode Pengembangan Sistem

[SITASI DIBUTUHKAN: definisi dan tahapan metode Waterfall, dari buku rekayasa perangkat lunak terbitan maksimal sepuluh tahun terakhir]

Penerapan metode Waterfall pada pengembangan sistem informasi berbasis web telah banyak dilakukan. Yusna dkk. (2025) menerapkan metode tersebut melalui tahapan analisis kebutuhan, perancangan sistem, implementasi, pengujian, dan evaluasi pada pembangunan sistem informasi manajemen proyek berbasis web, dengan pengujian *black box* yang menyatakan seluruh fungsi sistem valid. Penelitian ini menggunakan tahapan serupa, dengan tambahan pengujian mutu luaran yang tidak dilakukan pada penelitian tersebut.

### 2.2.8. Rubrik Penilaian dan Kesepakatan Antar-Penilai

[SITASI DIBUTUHKAN: penyusunan rubrik penilaian dan pengukuran kesepakatan antar-penilai, misalnya koefisien Kappa]

### 2.2.9. Notasi Perancangan Sistem

[SITASI DIBUTUHKAN: notasi *Unified Modeling Language* dan *Entity Relationship Diagram*]

## 2.3 Kerangka Berpikir

Kerangka berpikir penelitian ini disusun untuk menghubungkan permasalahan yang ditemukan di lapangan dengan hasil yang diharapkan melalui landasan teori dan penelitian terdahulu yang telah diuraikan. Alur kerangka berpikir tersebut disajikan pada Gambar 2.1.

Alur dimulai dari permasalahan, yaitu penyiapan materi konten yang memakan waktu lama serta gaya bahasa merek yang tidak konsisten antar admin. Permasalahan tersebut ditinjau menggunakan landasan teori mengenai sistem *multi-agent* berbasis model bahasa besar dan penggunaan konteks terstruktur, serta diperkuat oleh penelitian terdahulu yang menunjukkan bahwa pendekatan *multi-agent* telah terbukti pada ranah konseptual dan simulasi namun belum diterapkan pada produksi konten yang beroperasi nyata.

Dari tinjauan tersebut disusun rancangan sistem yang terdiri atas empat agen dengan pembagian tugas per modul, profil merek terstruktur yang disertakan sebagai konteks pada setiap permintaan, dan pencatatan atas setiap proses penghasilan materi. Rancangan tersebut kemudian diuji melalui dua jalur, yaitu pengukuran waktu produksi konten sebelum dan sesudah sistem diterapkan, serta penilaian konsistensi *brand voice* menggunakan rubrik oleh penilai yang tidak mengetahui asal-usul setiap sampel.

Hasil yang diharapkan dari alur tersebut adalah menurunnya waktu produksi konten dan meningkatnya konsistensi *brand voice* pada materi yang dihasilkan, sehingga ketiga rumusan masalah pada sub-bab 1.3 dapat terjawab.
