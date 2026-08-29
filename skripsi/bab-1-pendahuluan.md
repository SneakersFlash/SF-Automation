# BAB I PENDAHULUAN

## 1.1 Latar Belakang

Pertumbuhan perdagangan elektronik di Indonesia mendorong pelaku ritel untuk bersaing bukan hanya pada harga dan ketersediaan barang, melainkan juga pada kemampuan memproduksi materi pemasaran secara cepat dan berkelanjutan. [SITASI DIBUTUHKAN: data pertumbuhan perdagangan elektronik atau ritel daring di Indonesia, jurnal lima tahun terakhir] Pada segmen ritel sepatu olahraga, tuntutan tersebut semakin terasa karena siklus peluncuran produk berlangsung dalam hitungan hari dan setiap peluncuran menuntut materi pemasaran yang baru. [SITASI DIBUTUHKAN: karakteristik pemasaran konten pada ritel mode atau sepatu olahraga] Kecerdasan buatan generatif kemudian hadir sebagai jawaban atas tuntutan tersebut. Pemanfaatan model bahasa besar pada manajemen pemasaran modern telah dipetakan mencakup keterlibatan pelanggan, optimasi kampanye, dan penghasilan konten (Aghaei dkk., 2025).

SneakersFlash merupakan peritel sepatu olahraga yang memasarkan produknya melalui situs web, media sosial, dan sejumlah lokapasar. Setiap peluncuran produk menuntut penyiapan sejumlah materi sekaligus, mulai dari ringkasan konten, naskah unggahan media sosial, hingga naskah iklan berbayar. Seluruh materi tersebut saat ini disiapkan secara manual oleh tim admin. Penulisan naskah dikerjakan langsung oleh masing-masing admin, sementara pemanfaatan kecerdasan buatan generatif dilakukan secara lepas-lepas melalui antarmuka percakapan umum, tanpa standar penulisan dan tanpa konteks merek yang seragam.

Observasi terhadap proses tersebut menunjukkan empat persoalan. *Pertama*, penyiapan materi untuk satu peluncuran memerlukan waktu [ANGKA DARI DATA PENELITI: durasi rata-rata penyiapan konten sebelum sistem diterapkan, beserta satuan dan jumlah sampel]. *Kedua*, gaya bahasa yang dihasilkan berbeda-beda antar admin karena standar merek hanya tersimpan sebagai kesepakatan lisan dan tidak dieksekusi oleh sistem mana pun. *Ketiga*, karena perintah kepada kecerdasan buatan tidak menyertakan konteks merek, keluaran yang dihasilkan cenderung generik dan masih memerlukan penyuntingan ulang yang panjang. *Keempat*, tidak ada pencatatan atas keluaran kecerdasan buatan sehingga materi yang telah terbit tidak dapat ditelusuri kembali ketika terjadi kekeliruan.

Apabila keadaan tersebut dibiarkan, dampaknya berlapis. Jadwal peluncuran berpotensi meleset karena materi belum siap pada waktunya. Identitas merek menjadi kabur di mata konsumen ketika gaya bahasa berubah-ubah antar unggahan. Mutu materi bergantung sepenuhnya pada kemampuan individu admin, sehingga pergantian personel langsung menurunkan mutu keluaran. Selain itu, ketiadaan jejak pencatatan menyulitkan pertanggungjawaban ketika materi yang telah tayang ternyata keliru.

Penelitian ini mengusulkan sebuah sistem otomasi produksi konten pemasaran yang bekerja dengan pendekatan *multi-agent*, yaitu beberapa agen kecerdasan buatan yang masing-masing menangani satu tugas khusus dan dijalankan melalui satu gerbang layanan tunggal. Pendekatan *multi-agent* pada model bahasa besar memungkinkan sekumpulan agen berkoordinasi menyelesaikan tugas yang kompleks secara kolektif (Tran dkk., 2025). Pembeda utama sistem ini terletak pada penggunaan profil merek terstruktur yang memuat gaya bahasa, sasaran audiens, keunggulan produk, batasan penulisan, ajakan bertindak, pengetahuan produk, dan contoh naskah. Profil tersebut disertakan sebagai konteks pada setiap permintaan kepada agen, sehingga standar merek tidak lagi bergantung pada ingatan admin melainkan dieksekusi oleh sistem. Selain itu, penggunaan model bahasa besar pada penulisan menyimpan risiko halusinasi dan bias algoritmik (Rahman dkk., 2025). Karena itu setiap proses penghasilan materi dicatat sehingga dapat ditelusuri kembali, dan manusia tetap ditempatkan sebagai pemeriksa akhir.

Berdasarkan uraian tersebut, penulis mengambil judul penelitian *Otomasi Produksi Konten Pemasaran Berbasis Multi-Agent AI untuk Meningkatkan Efisiensi dan Konsistensi Brand Voice (Studi Kasus: SneakersFlash)*.

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
