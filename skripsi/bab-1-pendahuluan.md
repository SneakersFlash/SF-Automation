# BAB I PENDAHULUAN

## 1.1 Latar Belakang

Perdagangan elektronik di Indonesia telah mengubah cara pelaku ritel bersaing. Konsumen kini dapat membandingkan harga, ketersediaan, dan ulasan dari berbagai penjual dalam hitungan detik, sehingga keunggulan yang dahulu bertumpu pada lokasi toko tidak lagi memadai. [SITASI DIBUTUHKAN: pertumbuhan perdagangan elektronik atau ritel daring di Indonesia, jurnal maksimal lima tahun terakhir] Persaingan bergeser ke ranah yang lebih sulit ditiru, yaitu kemampuan sebuah merek membangun kehadiran yang dikenali secara terus-menerus di hadapan calon pembeli.

Kehadiran tersebut dibangun melalui materi pemasaran yang diterbitkan berkelanjutan di berbagai kanal. Berbeda dari iklan konvensional yang diproduksi sesekali, pemasaran berbasis konten menuntut produksi berulang dengan tenggat rapat, dan setiap kanal menuntut penyesuaian format tersendiri. [SITASI DIBUTUHKAN: karakteristik pemasaran konten pada ritel mode atau sepatu olahraga] Tuntutan itu membebani tim yang jumlahnya terbatas, terlebih pada peritel menengah yang tidak memiliki tim kreatif khusus.

Kecerdasan buatan generatif kemudian hadir sebagai jawaban. Aghaei dkk. (2025) memetakan penerapan model bahasa besar pada manajemen pemasaran modern dan menemukan bahwa teknologi ini telah dipakai untuk keterlibatan pelanggan, optimasi kampanye, serta penghasilan konten. Meskipun demikian, penelitian yang sama menyoroti persoalan yang menyertainya, yaitu privasi data, transparansi, dan mitigasi bias, sehingga penerapannya tidak dapat dilakukan tanpa kendali.

Persoalan tersebut bukan kekhawatiran teoretis semata. Rahman dkk. (2025), melalui kajian pustaka sistematis berprotokol PRISMA terhadap delapan artikel terpilih dari 339 dokumen awal, menemukan ketegangan mendasar antara tuntutan efisiensi produksi dan kewajiban menjaga integritas ketika model bahasa besar dipakai untuk menulis, dengan risiko utama berupa halusinasi dan bias algoritmik. Temuan itu menegaskan perlunya keseimbangan peran manusia dan mesin, bukan penyerahan penuh kepada mesin.

Salah satu arah pengembangan yang menjawab keterbatasan tersebut adalah pendekatan *multi-agent*, yaitu penggunaan beberapa agen kecerdasan buatan yang masing-masing menangani satu tugas khusus dan saling berkoordinasi. Tran dkk. (2025) menyusun kerangka yang mencirikan mekanisme kolaborasi antar-agen berdasarkan aktor, jenis interaksi, struktur, strategi, dan protokol koordinasi. Pada ranah luaran kreatif, Lin dkk. (2025) memetakan taksonomi proaktivitas agen dan desain persona serta teknik penyempurnaan iteratif. Pembagian tugas semacam ini memungkinkan tiap tahap produksi konten ditangani agen yang lebih terarah dibanding satu perintah tunggal.

Meskipun demikian, penerapannya pada ranah pemasaran masih terbatas. Chu dkk. (2025) telah membawa pendekatan tersebut ke pemasaran, namun agen dipakai untuk mensimulasikan perilaku konsumen dan menguji strategi, bukan memproduksi materi yang benar-benar diterbitkan. Sementara itu penelitian rancang bangun sistem informasi di Indonesia umumnya berhenti pada pengujian kesesuaian fungsi tanpa menilai mutu materi yang dihasilkan, sebagaimana terlihat pada Yusna dkk. (2025) dan Yunus dkk. (2025).

Jarak antara kemajuan tersebut dan penerapannya terasa nyata pada ritel sepatu olahraga. Segmen ini mengikuti siklus peluncuran yang cepat dengan jendela perhatian pendek, sehingga materi yang terlambat terbit kehilangan sebagian besar nilainya. Pada saat yang sama, konsumen segmen ini mengenali merek melalui cara merek tersebut berbicara, sehingga perubahan gaya bahasa antar unggahan langsung terasa dan melemahkan identitas merek.

SneakersFlash merupakan peritel sepatu olahraga yang memasarkan produknya melalui situs web, media sosial, dan sejumlah lokapasar. Setiap peluncuran menuntut penyiapan beberapa materi sekaligus, mulai dari ringkasan konten, naskah unggahan, hingga naskah iklan berbayar. Seluruh materi disiapkan secara manual oleh tim admin. Pemanfaatan kecerdasan buatan generatif dilakukan lepas-lepas melalui antarmuka percakapan umum, dengan perintah yang disusun sendiri oleh tiap admin tanpa acuan bersama.

Observasi terhadap proses tersebut menunjukkan empat persoalan. *Pertama*, penyiapan materi untuk satu peluncuran memerlukan waktu [ANGKA DARI DATA PENELITI: durasi rata-rata sebelum sistem diterapkan, sebutkan satuan dan jumlah sampel]. *Kedua*, gaya bahasa berbeda-beda antar admin karena standar merek hanya hidup sebagai kesepakatan lisan. *Ketiga*, karena perintah tidak menyertakan konteks merek, keluaran cenderung generik dan masih menuntut penyuntingan panjang sehingga penghematan waktu tidak tercapai. *Keempat*, keluaran tidak tercatat sehingga materi yang telah terbit tidak dapat ditelusuri kembali.

Apabila dibiarkan, dampaknya berlapis. Jadwal peluncuran berpotensi meleset dan momentum yang pendek terlewat. Identitas merek menjadi kabur ketika gaya bahasa berubah-ubah antar unggahan. Mutu materi bergantung sepenuhnya pada kemampuan masing-masing admin, sehingga pergantian personel langsung menurunkan mutu keluaran. Ketiadaan jejak pencatatan juga menyulitkan pertanggungjawaban ketika materi yang telah tayang ternyata keliru.

Berangkat dari keadaan tersebut, penelitian ini mengusulkan sistem otomasi produksi konten pemasaran berpendekatan *multi-agent* yang dijalankan melalui satu gerbang layanan tunggal. Pembedanya terletak pada profil merek terstruktur yang memuat gaya bahasa, sasaran audiens, keunggulan produk, batasan penulisan, ajakan bertindak, dan contoh naskah. Profil itu disertakan sebagai konteks pada setiap permintaan kepada agen, sehingga standar merek dieksekusi sistem dan tidak lagi bergantung pada ingatan admin. Sejalan dengan temuan Rahman dkk. (2025), setiap proses penghasilan materi dicatat dan manusia tetap menjadi pemeriksa akhir.

Sistem tersebut diharapkan menjawab dua persoalan sekaligus, yaitu lamanya waktu penyiapan materi dan tidak seragamnya gaya bahasa merek, dan kedua hal itulah yang menjadi ukuran keberhasilan penelitian ini. Berdasarkan seluruh uraian di atas, penulis mengambil judul penelitian *Otomasi Produksi Konten Pemasaran Berbasis Multi-Agent AI untuk Meningkatkan Efisiensi dan Konsistensi Brand Voice (Studi Kasus: SneakersFlash)*.

## 1.2 Identifikasi Masalah

Berdasarkan latar belakang yang penulis uraikan di atas, maka identifikasi masalah dalam penelitian ini adalah sebagai berikut:

a. Penyiapan materi konten untuk setiap peluncuran produk memerlukan waktu yang lama karena seluruh tahapannya dikerjakan secara manual;
b. Gaya bahasa merek berubah-ubah antar admin karena standar merek tidak dieksekusi oleh sistem;
c. Perintah kepada kecerdasan buatan dijalankan tanpa konteks merek sehingga keluaran yang dihasilkan cenderung generik dan menuntut penyuntingan ulang;
d. Keluaran kecerdasan buatan tidak tercatat sehingga materi yang telah terbit tidak dapat ditelusuri kembali;
e. Standar merek yang berlaku belum dapat dipakai ulang untuk merek lain.

## 1.3 Rumusan Masalah

Berdasarkan identifikasi masalah di atas, rumusan masalah dalam penelitian ini adalah sebagai berikut:

a. Bagaimana merancang dan membangun sistem otomasi produksi konten pemasaran berbasis *multi-agent* AI pada SneakersFlash?
b. Bagaimana pengaruh penerapan sistem tersebut terhadap efisiensi waktu produksi konten dibandingkan proses yang berjalan sebelumnya?
c. Sejauh mana profil merek terstruktur yang digunakan sistem dapat menjaga konsistensi *brand voice* pada keluaran konten?

## 1.4 Batasan Masalah

Agar pembahasan penelitian ini tetap fokus dan dapat diselesaikan dalam waktu yang tersedia, penulis menetapkan batasan sebagai berikut:

a. Objek penelitian adalah SneakersFlash dengan satu profil merek aktif;
b. Modul yang diteliti terbatas pada produksi konten, yaitu penyusunan ringkasan konten, penulisan naskah, dan penghalusan teks. Modul pendapatan dan performa media sosial berada di luar lingkup penelitian karena integrasinya belum aktif;
c. Model bahasa yang digunakan diperlakukan sebagai *kotak hitam*. Penelitian ini tidak mengevaluasi, membandingkan, maupun melatih ulang model;
d. Perbandingan efisiensi dilakukan antara proses lama secara keseluruhan dan proses baru secara keseluruhan. Penelitian ini tidak mengisolasi kontribusi arsitektur *multi-agent* semata, karena antarmuka terpusat dan arsitektur agen diterapkan secara bersamaan;
e. Konsistensi *brand voice* dinilai oleh manusia menggunakan rubrik penilaian, bukan menggunakan perangkat pendeteksi teks kecerdasan buatan otomatis;
f. Aspek keamanan sistem dan infrastruktur penempatan aplikasi tidak dibahas dalam penelitian ini.

## 1.5 Tujuan Penelitian

Berdasarkan rumusan masalah yang telah diuraikan, tujuan penelitian ini adalah sebagai berikut:

a. Merancang dan membangun sistem otomasi produksi konten pemasaran berbasis *multi-agent* AI pada SneakersFlash;
b. Mengukur pengaruh penerapan sistem terhadap efisiensi waktu produksi konten dibandingkan proses yang berjalan sebelumnya;
c. Mengevaluasi sejauh mana profil merek terstruktur dapat menjaga konsistensi *brand voice* pada keluaran konten.

## 1.6 Manfaat Penelitian

Berdasarkan latar belakang dan rumusan masalah yang telah dipaparkan, penelitian ini diharapkan memberikan manfaat sebagai berikut:

a. Manfaat Bagi Universitas Pamulang

Menambah rujukan mengenai penerapan kecerdasan buatan generatif pada proses bisnis nyata di lingkungan Program Studi Sistem Informasi, serta menyediakan bahan pembanding bagi penelitian sejenis yang mengangkat otomasi berbasis agen.

b. Manfaat Bagi Instansi

Memangkas waktu penyiapan materi konten pada setiap peluncuran produk, menjaga identitas merek tetap seragam antar admin tanpa bergantung pada ingatan individu, serta menyediakan jejak pencatatan atas seluruh keluaran kecerdasan buatan sehingga dapat dipertanggungjawabkan.

c. Manfaat Bagi Penulis

Menerapkan secara langsung ilmu analisis dan perancangan sistem, rekayasa perangkat lunak, serta metodologi penelitian yang diperoleh selama perkuliahan pada permasalahan nyata, sekaligus melatih kemampuan menyusun karya tulis ilmiah sesuai kaidah yang berlaku.
