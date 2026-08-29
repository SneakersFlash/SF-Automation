# BAB II TINJAUAN PUSTAKA

## 2.1 Penelitian Terdahulu

Penelusuran penelitian terdahulu dilakukan pada basis data Scopus, arXiv, ACL Anthology, Garuda, dan Google Scholar. Kata kunci yang digunakan meliputi *multi-agent large language model*, *content generation*, *marketing content automation*, *brand voice consistency*, *rubric-based evaluation*, serta padanannya dalam bahasa Indonesia yaitu otomasi konten pemasaran, kecerdasan buatan generatif, dan rancang bangun sistem informasi. Kriteria inklusi yang ditetapkan adalah publikasi terbitan tahun 2021 sampai 2026, berbahasa Indonesia atau Inggris, dan membahas penerapan model bahasa besar pada produksi konten, evaluasi luaran teks, atau pengembangan sistem informasi. Penelusuran menghasilkan dua puluh penelitian yang relevan.

Kedua puluh penelitian tersebut disajikan dalam dua bentuk yang saling melengkapi. Sepuluh penelitian pertama diuraikan secara naratif pada bagian ini karena masing-masing membentuk satu mata rantai argumen yang menuntun pada celah riset. Sepuluh penelitian berikutnya disajikan dalam bentuk tabel pada Tabel 2.1 karena kedudukannya sebagai pembanding metode pengembangan dan pembanding konteks lokal, sehingga cukup dibandingkan pada dimensi yang sama tanpa perlu diuraikan satu per satu.

Aghaei dkk. (2025) memetakan penerapan model bahasa besar pada manajemen pemasaran modern melalui kajian konseptual. Penelitian tersebut menemukan bahwa teknologi ini telah dipakai untuk keterlibatan pelanggan, optimasi kampanye, dan penghasilan konten, sekaligus mengangkat persoalan privasi data, transparansi, dan mitigasi bias. Kontribusinya terletak pada pemetaan peluang yang luas beserta rambu penerapannya. Namun penelitian tersebut tidak membangun maupun menguji sistem, sehingga tidak menghasilkan bukti mengenai besarnya perubahan yang terjadi ketika teknologi itu benar-benar dipasang pada proses kerja yang berjalan.

Rahman dkk. (2025) menelaah penggunaan model bahasa besar pada penulisan artikel berita melalui kajian pustaka sistematis berprotokol PRISMA terhadap delapan artikel terpilih dari 339 dokumen awal. Temuannya menunjukkan ketegangan mendasar antara tuntutan efisiensi produksi dan kewajiban menjaga integritas, dengan risiko berupa halusinasi dan bias algoritmik. Penelitian ini penting karena berlatar Indonesia dan menegaskan perlunya keseimbangan peran manusia dan mesin. Perbedaannya, domain yang dibahas adalah jurnalisme yang tunduk pada kaidah pemberitaan, bukan konten pemasaran yang tunduk pada identitas merek, dan kajian tersebut tidak menghasilkan artefak sistem.

Kirkby dkk. (2023) menguji secara eksperimental bagaimana konsumen menanggapi *brand voice* yang sumbernya didisklosur sebagai kecerdasan buatan. Melalui rancangan 3x3 terhadap 624 responden dengan materi pemasaran Adidas dan analisis *structural equation modeling*, penelitian tersebut menemukan bahwa teks yang dinyatakan dihasilkan kecerdasan buatan tidak dipersepsikan kurang autentik dibanding teks yang dinyatakan ditulis manusia. Temuan ini melemahkan kekhawatiran bahwa penggunaan kecerdasan buatan otomatis merusak persepsi merek. Meskipun demikian, penelitian tersebut menguji persepsi konsumen terhadap sumber teks, bukan menguji apakah teks yang dihasilkan benar-benar konsisten dengan gaya bahasa merek yang telah ditetapkan.

Wang dkk. (2025) menguji kemampuan model bahasa besar meniru gaya menulis penulis nyata melalui lebih dari 40.000 luaran model pada lebih dari 400 penulis di ranah berita, surel, forum, dan blog. Hasilnya menunjukkan model berhasil meniru konvensi penulisan pada format yang terstruktur, tetapi gagal menangkap gaya informal yang khas pada blog dan forum. Temuan ini menjadi landasan penting bagi penelitian ini karena menunjukkan bahwa memberi contoh naskah saja tidak cukup untuk memindahkan gaya bahasa ke luaran model. Konsekuensinya, gaya merek perlu dinyatakan secara eksplisit dan terstruktur, bukan sekadar dititipkan lewat contoh.

Tran dkk. (2025) menyusun kerangka yang mencirikan mekanisme kolaborasi pada sistem *multi-agent* berbasis model bahasa besar berdasarkan aktor yang terlibat, jenis interaksi, struktur organisasi, strategi, dan protokol koordinasi. Kerangka tersebut menjadi acuan yang berguna dalam merancang pembagian tugas antar-agen. Kontribusinya bersifat menata bidang kajian agar dapat dikembangkan lebih lanjut. Perbedaannya dengan penelitian ini terletak pada tataran pembahasan, karena kerangka tersebut tidak diuji pada satu proses bisnis tertentu dan tidak disertai pengukuran dampak penerapannya.

Lin dkk. (2025) memetakan kreativitas pada sistem *multi-agent* berbasis model bahasa besar dan menyusun taksonomi proaktivitas agen serta desain persona, dilengkapi teknik eksplorasi divergen, penyempurnaan iteratif, dan sintesis kolaboratif. Gagasan desain persona pada penelitian tersebut sejalan dengan penggunaan profil merek sebagai konteks pada penelitian ini, karena keduanya berupaya mengarahkan perilaku agen melalui identitas yang ditetapkan sebelumnya. Bedanya, penelitian tersebut menilai kreativitas luaran sebagai tujuan, sedangkan penelitian ini justru menilai kepatuhan luaran pada identitas merek yang telah ditentukan.

Chu dkk. (2025) membangun kerangka simulasi berbasis *multi-agent* agar agen generatif dapat berinteraksi, menyatakan penalaran internal, membentuk kebiasaan, dan mengambil keputusan pembelian, sehingga strategi pemasaran seperti potongan harga dapat diuji sebelum diterapkan. Penelitian ini membuktikan bahwa pendekatan *multi-agent* dapat dibawa ke ranah pemasaran secara nyata. Namun peran agen di sana adalah menirukan sisi konsumen untuk keperluan pengujian strategi, bukan memproduksi materi konten yang akan diterbitkan merek. Dengan kata lain, agen ditempatkan pada sisi permintaan, bukan pada sisi produksi.

Purpura dkk. (2025) merancang alur kerja bertahap yang memanfaatkan model bahasa besar dengan kemampuan penalaran untuk menelaah apakah materi pemasaran memenuhi kriteria kepatuhan tertentu, serta membandingkan beberapa pendekatan pelatihan model. Penelitian ini paling dekat dengan penelitian sekarang karena sama-sama menempatkan model bahasa besar pada alur kerja bertahap di ranah konten pemasaran. Perbedaan mendasarnya terletak pada arah kerja: alur tersebut menelaah materi yang sudah ada untuk mendeteksi pelanggaran kepatuhan, sedangkan penelitian ini menghasilkan materi baru dan menilai kesesuaiannya dengan identitas merek.

Hashemi dkk. (2024) mengembangkan pendekatan penilaian teks secara otomatis dan terkalibrasi menggunakan rubrik berdimensi banyak, dengan melatih jaringan saraf yang menggabungkan parameter khusus penilai dan parameter umum untuk memperkirakan penilaian manusia. Penelitian tersebut menunjukkan bahwa mutu teks dapat dinilai secara terstruktur melalui dimensi yang dirumuskan terlebih dahulu, dan gagasan itulah yang diadopsi pada penyusunan rubrik penilaian di penelitian ini. Perbedaannya, penelitian tersebut berupaya menggantikan penilai manusia dengan model, sedangkan penelitian ini tetap menempatkan manusia sebagai penilai dan justru melaporkan kesepakatan antar-penilai sebagai bagian dari hasil.

Yusna dkk. (2025) membangun sistem informasi manajemen proyek berbasis web menggunakan metode Waterfall dengan tahapan analisis kebutuhan, perancangan, implementasi, pengujian, dan evaluasi, lalu menyatakan seluruh fungsi sistem valid melalui pengujian *black box*. Penelitian ini mewakili corak penelitian rancang bangun sistem informasi yang lazim di Indonesia dan menjadi pembanding langsung bagi pilihan metode pada penelitian sekarang. Perbedaannya ada pada dua hal: metode sekuensial yang dipakai tidak menampung putaran umpan balik, dan pengujian berhenti pada kesesuaian fungsi tanpa menilai mutu materi yang dihasilkan sistem.

Sepuluh penelitian berikutnya berkedudukan sebagai pembanding metode pengembangan dan pembanding konteks lokal. Ringkasannya disajikan pada Tabel 2.1.

| Penulis dan Tahun | Judul | Metode | Hasil | Perbedaan dengan Penelitian Ini |
| --- | --- | --- | --- | --- |
| Yan dkk. (2025) | Beyond Self-Talk: A Communication-Centric Survey of LLM-Based Multi-Agent Systems | Kajian pustaka | Menyusun kerangka komunikasi antar-agen pada tataran sistem dan internal, serta menandai persoalan efisiensi dan keamanan | Membahas komunikasi antar-agen secara umum, tidak diterapkan pada produksi konten |
| Truong dkk. (2025) | Persona-Augmented Benchmarking: Evaluating LLMs Across Diverse Writing Styles | Eksperimen tolok ukur berbasis persona | Ragam gaya menulis dan format perintah berpengaruh nyata pada penilaian kinerja model | Persona dipakai untuk menguji model, bukan untuk menjaga identitas merek pada luaran |
| Borse dkk. (2025) | Investigation of the Inter-Rater Reliability between LLMs and Human Raters in Qualitative Analysis | Eksperimen penilaian transkrip | Kesepakatan substansial pada tiga tema dan moderat pada satu tema | Menguji model sebagai pengganti penilai, sedangkan penelitian ini memakai penilai manusia |
| Djaini dkk. (2025) | Analisis Strategi Adaptif UMKM terhadap Integrasi Teknologi ChatGPT | Kajian pustaka atas 31 artikel | Integrasi menuntut kapabilitas dinamis, kesiapan organisasi, dan penerimaan teknologi | Bersifat kajian strategi, tidak membangun sistem maupun mengukur luaran |
| Hanum dkk. (2026) | Rancang Bangun Sistem Informasi UMKM Berbasis Web untuk Promosi Digital Menggunakan Metode RAD | RAD dengan pengujian black box dan UAT | Seluruh fungsi berjalan sesuai kebutuhan dengan penerimaan pengguna sangat baik | Sistem mengelola data promosi, tidak menghasilkan materi konten |
| Rasim dkk. (2025) | Rancang Bangun Sistem Informasi Monitoring dan Analisis Kinerja Penjualan Menggunakan Metode RAD | RAD, menekankan Requirements Planning dan Design Workshop | Mengotomasi perhitungan dan pelaporan capaian penjualan serta menghapus duplikasi data | Mengotomasi pelaporan angka, bukan produksi materi konten |
| Yunus dkk. (2025) | Penerapan Metode RAD pada Rancang Bangun Sistem Informasi Barang Hilang dan Temuan Berbasis Website | RAD dengan black box dan System Usability Scale | Menghasilkan sistem informasi barang hilang dan temuan untuk keamanan kampus | Domain layanan kampus, mutu luaran sistem tidak dinilai dengan rubrik |
| Nugroho dkk. (2024) | Rancang Bangun Sistem Informasi Pusat Data Berbasis Website Menggunakan Metode Prototype | Prototype dengan pengujian black box | Seluruh fitur berjalan dengan baik | Metode iteratif dipakai tanpa melibatkan kecerdasan buatan |
| Priyono dkk. (2025) | Penerapan Metode Prototype pada Pengembangan Sistem Informasi Penjualan Jasa Instalasi Internet | Prototype dengan black box terhadap lima pengguna | Seluruh fungsi berjalan baik, efisiensi penjualan meningkat dan kesalahan masukan berkurang | Efisiensi diukur pada proses transaksi, bukan pada produksi materi konten |
| Pawana dkk. (2024) | Rancang Bangun Sistem Informasi Pengelolaan Surat Berbasis Web di Fakultas Vokasi Universitas Warmadewa | Research and Development dengan black box | Efisiensi pengelolaan surat meningkat lebih dari 70 persen dibanding cara manual | Efisiensi diukur pada proses administratif dan tanpa penilaian mutu luaran |

Berdasarkan uraian naratif dan Tabel 2.1 dapat ditarik beberapa simpulan. Pada kelompok kajian teknologi, mekanisme kolaborasi *multi-agent* telah dipetakan dengan baik oleh Tran dkk. (2025), Lin dkk. (2025), dan Yan dkk. (2025), namun seluruhnya berhenti pada tataran konseptual. Ketika pendekatan tersebut dibawa ke ranah pemasaran, Chu dkk. (2025) menempatkannya pada sisi konsumen dan Purpura dkk. (2025) menempatkannya pada penelaahan materi yang sudah ada, sehingga sisi produksi materi belum tergarap.

Pada kelompok identitas merek, Kirkby dkk. (2023) menunjukkan bahwa pengungkapan sumber kecerdasan buatan tidak merusak persepsi keaslian merek, sementara Wang dkk. (2025) justru menunjukkan bahwa model kesulitan meniru gaya menulis yang tidak dinyatakan secara eksplisit. Kedua temuan ini bila digabungkan mengarah pada satu kesimpulan: persoalannya bukan pada penggunaan kecerdasan buatan itu sendiri, melainkan pada cara gaya bahasa merek disampaikan kepada model.

Pada kelompok rancang bangun sistem informasi di Indonesia, Yusna dkk. (2025), Rasim dkk. (2025), Yunus dkk. (2025), Hanum dkk. (2026), Nugroho dkk. (2024), Priyono dkk. (2025), dan Pawana dkk. (2024) menunjukkan pola yang seragam. Pengujian umumnya berhenti pada kesesuaian fungsi melalui *black box*, sebagian menambahkan pengukuran kebergunaan atau efisiensi proses, tetapi tidak satu pun menilai mutu materi yang dihasilkan sistem. Sementara itu Hashemi dkk. (2024) dan Borse dkk. (2025) telah menyediakan cara menilai mutu teks secara terstruktur, namun keduanya berupaya menggantikan penilai manusia, bukan mendampinginya.

Dengan demikian terdapat celah riset yang belum terisi. Belum ditemukan penelitian yang sekaligus membangun sistem produksi konten pemasaran yang benar-benar dioperasikan, menerapkan arsitektur *multi-agent* dengan pembagian tugas per modul, menggunakan profil merek terstruktur sebagai konteks untuk menjawab keterbatasan peniruan gaya yang ditemukan Wang dkk. (2025), serta mengukur dampaknya pada dua sisi sekaligus yaitu efisiensi waktu dan konsistensi *brand voice* dalam konteks ritel berbahasa Indonesia. Celah inilah yang hendak diisi oleh penelitian ini.

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

*Brand voice* adalah cara sebuah merek berbicara kepada audiensnya, yang tercermin pada nada, pilihan kata, dan tingkat formalitas yang digunakan secara konsisten di seluruh titik sentuh. Kirkby dkk. (2023) meneliti keaslian *brand voice* dalam kaitannya dengan keaslian merek dan sikap terhadap merek, dan menemukan melalui eksperimen 3x3 terhadap 624 responden bahwa teks yang dinyatakan dihasilkan kecerdasan buatan tidak dipersepsikan kurang autentik dibanding teks yang dinyatakan ditulis manusia. Temuan tersebut menunjukkan bahwa yang menentukan persepsi bukan sumber teksnya, melainkan kesesuaian teks dengan suara merek yang telah dikenal audiens.

Kesesuaian tersebut tidak terbentuk dengan sendirinya. Wang dkk. (2025) menemukan bahwa model bahasa besar kesulitan meniru gaya menulis yang tidak dinyatakan secara eksplisit, terutama gaya informal. Oleh karena itu penelitian ini memperlakukan *brand voice* sebagai sekumpulan ketentuan tertulis dan terstruktur yang disertakan sebagai konteks, bukan sebagai gaya yang diharapkan tertangkap sendiri oleh model dari contoh naskah.

[SITASI DIBUTUHKAN: satu definisi baku *brand voice* dari buku *branding* atau jurnal manajemen pemasaran, terbitan maksimal sepuluh tahun terakhir, untuk memperkuat paragraf pembuka]

### 2.2.5. Otomasi Alur Kerja dan Antrian Tugas

[SITASI DIBUTUHKAN: konsep *workflow automation* dan antrian tugas asinkron pada aplikasi web]

### 2.2.6. Arsitektur Aplikasi Web dan REST API

[SITASI DIBUTUHKAN: arsitektur klien-server dan prinsip REST API]

### 2.2.7. Metode Pengembangan Sistem Rapid Application Development

*Rapid Application Development* atau RAD adalah metode pengembangan sistem yang bersifat iteratif dan melibatkan pengguna pada setiap tahapannya (Yunus dkk., 2025). Berbeda dari metode sekuensial yang menuntut setiap tahap diselesaikan sepenuhnya sebelum tahap berikutnya dimulai, RAD memungkinkan hasil pada suatu tahap dievaluasi dan diperbaiki sebelum sistem dinyatakan selesai. Ciri lain yang melekat pada metode ini adalah siklus pengembangan yang pendek serta ukuran tim yang kecil.

Tahapan RAD terdiri atas empat fase. *Requirements Planning* merupakan fase penetapan kebutuhan dan ruang lingkup sistem. *User Design* atau *Design Workshop* merupakan fase perancangan yang dijalankan bersama pengguna secara berulang. *Construction* merupakan fase pembangunan sistem berdasarkan rancangan yang telah disepakati. *Cutover* merupakan fase peralihan sistem ke lingkungan operasional.

Penerapan RAD pada pengembangan sistem informasi berbasis web telah banyak dilakukan di Indonesia. Rasim dkk. (2025) menerapkan RAD pada pembangunan sistem informasi monitoring dan analisis kinerja penjualan dengan menitikberatkan fase *Requirements Planning* dan *Design Workshop*, dan menghasilkan sistem yang mengotomasi perhitungan serta pelaporan capaian penjualan sekaligus menghapus duplikasi data. Yunus dkk. (2025) menerapkan RAD pada sistem informasi barang hilang dan temuan berbasis web, dengan pengujian *black box* yang dilengkapi pengukuran *System Usability Scale*.

Metode RAD dipilih pada penelitian ini karena sesuai dengan sifat pengembangan yang benar-benar berlangsung. Rancangan kemampuan agen dan penyusunan konteks merek beberapa kali disempurnakan setelah sistem berjalan, berdasarkan penilaian terhadap mutu materi yang dihasilkan. Sebagai pembanding, Yusna dkk. (2025) mengembangkan sistem sejenis menggunakan metode Waterfall yang bersifat sekuensial. Metode sekuensial tersebut tidak dipilih karena tidak menggambarkan adanya putaran umpan balik yang terjadi pada penelitian ini.

### 2.2.8. Rubrik Penilaian dan Kesepakatan Antar-Penilai

[SITASI DIBUTUHKAN: penyusunan rubrik penilaian dan pengukuran kesepakatan antar-penilai, misalnya koefisien Kappa]

### 2.2.9. Notasi Perancangan Sistem

[SITASI DIBUTUHKAN: notasi *Unified Modeling Language* dan *Entity Relationship Diagram*]

## 2.3 Kerangka Berpikir

Kerangka berpikir penelitian ini disusun untuk menghubungkan permasalahan yang ditemukan di lapangan dengan hasil yang diharapkan melalui landasan teori dan penelitian terdahulu yang telah diuraikan. Alur kerangka berpikir tersebut disajikan pada Gambar 2.1.

Alur dimulai dari permasalahan, yaitu penyiapan materi konten yang memakan waktu lama serta gaya bahasa merek yang tidak konsisten antar admin. Permasalahan tersebut ditinjau menggunakan landasan teori mengenai sistem *multi-agent* berbasis model bahasa besar dan penggunaan konteks terstruktur, serta diperkuat oleh penelitian terdahulu yang menunjukkan bahwa pendekatan *multi-agent* telah terbukti pada ranah konseptual dan simulasi namun belum diterapkan pada produksi konten yang beroperasi nyata.

Dari tinjauan tersebut disusun rancangan sistem yang terdiri atas empat agen dengan pembagian tugas per modul, profil merek terstruktur yang disertakan sebagai konteks pada setiap permintaan, dan pencatatan atas setiap proses penghasilan materi. Rancangan tersebut kemudian diuji melalui dua jalur, yaitu pengukuran waktu produksi konten sebelum dan sesudah sistem diterapkan, serta penilaian konsistensi *brand voice* menggunakan rubrik oleh penilai yang tidak mengetahui asal-usul setiap sampel.

Hasil yang diharapkan dari alur tersebut adalah menurunnya waktu produksi konten dan meningkatnya konsistensi *brand voice* pada materi yang dihasilkan, sehingga ketiga rumusan masalah pada sub-bab 1.3 dapat terjawab.
