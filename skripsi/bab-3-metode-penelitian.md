# BAB III METODE PENELITIAN

## 3.1 Analisis Kebutuhan

### 3.1.1. Analisis Sistem yang Sedang Berjalan

Sistem yang berjalan saat ini sepenuhnya bersifat manual. Ketika sebuah produk akan diluncurkan, admin menerima informasi produk dari tim, lalu menyusun sendiri ringkasan konten, naskah unggahan, dan naskah iklan. Sebagian admin memanfaatkan kecerdasan buatan generatif melalui antarmuka percakapan umum, namun perintah disusun sendiri oleh masing-masing admin tanpa acuan bersama. Naskah yang dihasilkan kemudian disunting ulang, diperiksa secara lisan oleh rekan atau atasan, lalu diunggah ke kanal yang dituju. Alur tersebut digambarkan pada Gambar 3.1 dalam bentuk *activity diagram*.

Pada alur ini tidak terdapat berkas acuan yang mengikat mengenai gaya bahasa merek, dan tidak terdapat pencatatan atas naskah yang dihasilkan. Standar merek hanya hidup sebagai kesepakatan lisan antar admin.

### 3.1.2. Permasalahan Sistem yang Sedang Berjalan

Berdasarkan analisis pada sub-bab sebelumnya dan identifikasi masalah pada sub-bab 1.2, permasalahan sistem yang berjalan adalah sebagai berikut:

a. Waktu penyiapan materi konten panjang karena setiap naskah disusun dari awal secara manual;
b. Gaya bahasa merek tidak seragam karena standar merek tidak dieksekusi oleh sistem;
c. Keluaran kecerdasan buatan bersifat generik karena perintah tidak menyertakan konteks merek;
d. Tidak tersedia jejak pencatatan atas naskah yang dihasilkan sehingga penelusuran kembali tidak dimungkinkan.

### 3.1.3. Usulan Sistem

Sistem yang diusulkan berupa aplikasi web internal yang menyatukan proses produksi konten dalam satu tempat. Arsitekturnya terdiri atas tiga lapis dan disajikan pada Gambar 3.2. Lapis pertama adalah antarmuka pengguna berbasis web. Lapis kedua adalah layanan *backend* yang menjadi satu-satunya pintu menuju basis data maupun layanan luar. Lapis ketiga adalah gerbang agen model bahasa besar yang menaungi empat agen dengan tugas berbeda, yaitu agen penyusun ringkasan konten, agen penulis naskah, agen penghalus teks, dan agen penyusun materi iklan.

Perbedaan mendasar dengan sistem yang berjalan terletak pada penyertaan konteks. Sebelum permintaan dikirim ke agen, layanan *backend* mengambil profil merek yang aktif dari basis data dan menyertakannya ke dalam muatan permintaan. Profil merek tersebut memuat gaya bahasa, sasaran audiens, keunggulan produk, batasan penulisan, ajakan bertindak, pengetahuan produk, dan contoh naskah. Dengan cara ini standar merek dieksekusi oleh sistem dan tidak lagi bergantung pada ingatan masing-masing admin.

Antarmuka pengguna tidak pernah mengakses gerbang agen maupun basis data secara langsung; seluruh permintaan melewati layanan *backend*. Setiap proses penghasilan naskah dicatat beserta masukan, keluaran, dan penggunanya. Proses gabungan yang menghasilkan beberapa materi sekaligus dijalankan secara asinkron melalui antrian tugas agar antarmuka tidak terkunci menunggu. Perancangan interaksi pengguna dengan sistem disajikan pada Gambar 3.3 dalam bentuk *use case diagram*, sedangkan rancangan basis data disajikan pada Gambar 3.4 dalam bentuk *entity relationship diagram*.

### 3.1.4. Kebutuhan Fungsional

Kebutuhan fungsional yang menjadi objek penelitian disajikan pada Tabel 3.1. Sesuai batasan pada sub-bab 1.4, modul performa media sosial dan modul pendapatan tidak dimasukkan karena integrasinya belum aktif dan berada di luar lingkup penelitian.

| Kode | Kebutuhan | Aktor | Keterangan |
| --- | --- | --- | --- |
| AUTH-01 | Masuk ke sistem | Owner, Member | Menggunakan surel dan kata sandi |
| AUTH-02 | Keluar dari sistem | Owner, Member | Mengakhiri sesi kerja |
| AUTH-03 | Mengubah kata sandi | Owner, Member | Mengubah kata sandi sendiri |
| USER-01 | Menambah akun Member | Owner | Akun dibuat manual oleh Owner |
| USER-02 | Menonaktifkan Member | Owner | Akun tidak dihapus, hanya dinonaktifkan |
| USER-03 | Melihat daftar pengguna | Owner | Daftar seluruh akun |
| BRAND-01 | Menambah profil merek | Owner, Member | Membuat profil merek baru |
| BRAND-02 | Mengubah profil merek | Owner, Member | Mengubah gaya bahasa, audiens, dan batasan |
| BRAND-03 | Menghapus profil merek | Owner | Hanya dapat dilakukan Owner |
| BRAND-04 | Menetapkan profil bawaan | Owner | Satu profil menjadi bawaan |
| BRAND-05 | Memilih profil aktif | Owner, Member | Profil yang dipakai pada sesi kerja |
| SUBJ-01 | Memasukkan subjek | Owner, Member | Data produk atau kampanye |
| SUBJ-02 | Menyimpan subjek | Owner, Member | Dipakai ulang lintas panel |
| CRE-01 | Menghasilkan ringkasan konten | Owner, Member | Per format unggahan |
| CRE-02 | Menghasilkan naskah | Owner, Member | Pembuka, isi, ajakan bertindak, tagar |
| CRE-03 | Menghaluskan teks | Owner, Member | Menjadikan naskah lebih wajar |
| CRE-04 | Menjalankan proses gabungan | Owner, Member | Dijalankan asinkron melalui antrian |
| CRE-05 | Menyalin keluaran | Owner, Member | Menyalin hasil ke papan klip |
| AUD-01 | Mencatat proses penghasilan | Sistem | Masukan, keluaran, dan pengguna dicatat |
| AUD-02 | Melihat riwayat | Owner | Riwayat seluruh proses penghasilan |

### 3.1.5. Kebutuhan Non-Fungsional

Kebutuhan non-fungsional sistem adalah sebagai berikut:

a. Performa: permintaan data yang telah tersimpan sementara ditanggapi di bawah 800 milidetik, sedangkan permintaan kepada agen menampilkan indikator proses dengan batas waktu tunggu yang wajar;
b. Keamanan: antarmuka pengguna tidak mengakses gerbang agen maupun basis data secara langsung, kata sandi disimpan dalam bentuk *hash*, dan seluruh kunci rahasia hanya berada pada lingkungan peladen;
c. Keandalan: kegagalan permintaan ditampilkan sebagai pesan yang dapat ditindaklanjuti, disertai kemungkinan mengulang permintaan;
d. Kebergunaan: antarmuka dapat diakses sampai peramban telepon genggam dan menggunakan bahasa Indonesia;
e. Skalabilitas: layanan *backend* disusun modular per fitur sehingga penambahan profil merek maupun agen baru tidak menuntut perombakan.

### 3.1.6. Kebutuhan Perangkat Keras dan Perangkat Lunak

Kebutuhan perangkat lunak untuk pengembangan dan pengoperasian sistem adalah sebagai berikut:

a. Antarmuka pengguna dibangun menggunakan kerangka kerja Next.js dengan bahasa TypeScript;
b. Layanan *backend* dibangun menggunakan kerangka kerja NestJS dengan bahasa TypeScript dan pemeta basis data Prisma;
c. Basis data menggunakan PostgreSQL;
d. Penyimpanan sementara dan antrian tugas menggunakan Redis;
e. Kemampuan generatif diakses melalui gerbang agen model bahasa besar;
f. Seluruh layanan dijalankan dalam wadah menggunakan Docker.

Kebutuhan perangkat keras minimal berupa peladen dengan prosesor empat inti, memori 8 gigabita, dan ruang penyimpanan 40 gigabita, serta komputer pengguna dengan peramban modern.

## 3.2 Metode Penelitian

### 3.2.1. Pendekatan Penelitian

Penelitian ini menggunakan pendekatan campuran. Pendekatan kuantitatif digunakan untuk mengukur efisiensi waktu produksi konten sebelum dan sesudah sistem diterapkan. Pendekatan kuantitatif berbasis penilaian juga digunakan untuk menilai konsistensi *brand voice* melalui rubrik yang diisi oleh penilai. Pendekatan kualitatif digunakan secara terbatas melalui observasi dan wawancara untuk memahami proses yang berjalan dan menyusun kebutuhan sistem.

### 3.2.2. Metode Pengumpulan Data

Data dikumpulkan melalui empat cara sebagai berikut:

a. Observasi terhadap proses penyiapan materi konten yang berjalan di SneakersFlash;
b. Wawancara dengan admin yang menjalankan proses tersebut untuk menggali kendala dan kebutuhan;
c. Dokumentasi, berupa catatan waktu penyiapan konten sebelum sistem diterapkan serta arsip naskah yang pernah diterbitkan;
d. Eksperimen, berupa penghasilan naskah menggunakan sistem untuk kemudian dinilai konsistensinya.

### 3.2.3. Populasi dan Sampel

Populasi penelitian ini adalah seluruh materi konten pemasaran yang diproduksi SneakersFlash pada periode penelitian. Sampel diambil secara sengaja dengan mempertimbangkan keterwakilan format unggahan.

Instrumen penilaian telah disusun terlebih dahulu dan disajikan pada Tabel 3.2, sedangkan penetapan jumlah naskah yang diuji beserta jumlah dan asal penilai dilakukan setelah materi konten pada kanal media sosial terkumpul.

[BUTUH KEPUTUSAN PENULIS: tetapkan jumlah naskah yang diuji serta jumlah dan asal penilai setelah materi terkumpul. Jumlah penilai sekurang-kurangnya tiga orang, dan penilai dari luar tim jauh lebih kuat menahan keberatan mengenai keberpihakan.]

Data durasi penyiapan konten sebelum sistem diterapkan diperoleh sebagai estimasi retrospektif dari praktik kerja tim, yaitu satu sampai tiga jam per materi dengan kasus ekstrem mencapai dua belas jam, dan kebutuhan penerbitan lima materi per hari. Data tersebut bukan catatan waktu yang terekam sistem, sehingga diperlakukan sebagai rentang, bukan sebagai nilai tunggal yang presisi. Durasi pada proses baru diukur langsung selama penelitian berlangsung menggunakan lembar catat waktu.

### 3.2.4. Instrumen Penelitian

Penelitian ini menggunakan dua instrumen. Instrumen pertama adalah lembar catat waktu yang merekam durasi penyiapan materi konten untuk setiap peluncuran produk, baik pada proses lama maupun pada proses yang menggunakan sistem.

Instrumen kedua adalah matriks penilaian konsistensi *brand voice* yang disajikan pada Tabel 3.2. Dimensi matriks diturunkan dari bidang yang tersimpan pada profil merek di dalam sistem, sehingga penilaian dapat ditelusuri kembali ke acuan yang benar-benar dipakai sistem saat menghasilkan naskah. Setiap dimensi dinilai pada rentang 1 sampai 4, sehingga skor maksimal seluruh dimensi adalah 20.

Deskriptor pada setiap tingkat skor ditulis secara operasional agar penilai tidak perlu menafsirkan sendiri batas antar-tingkat. Hal ini penting karena penilaian dilakukan oleh lebih dari satu orang secara mandiri, dan kesepakatan antar-penilai hanya bermakna bila seluruh penilai membaca ukuran yang sama.

|: 1600 1584 1584 1584 1584
| Dimensi | Skor 1 | Skor 2 | Skor 3 | Skor 4 |
| --- | --- | --- | --- | --- |
| Gaya bahasa | Nada dan tingkat formalitas menyimpang jelas dari profil merek | Terdapat pergeseran nada yang mencolok pada sebagian kalimat | Nada sesuai secara keseluruhan dengan satu atau dua penyimpangan kecil | Nada, sapaan, dan tingkat formalitas konsisten di seluruh teks |
| Sasaran audiens | Diksi dan rujukan tidak sesuai audiens yang ditetapkan | Sebagian diksi sesuai, sebagian terasa salah sasaran | Sesuai audiens dengan sedikit istilah yang kurang tepat | Diksi dan rujukan tepat sasaran di seluruh teks |
| Keunggulan produk | Keunggulan tidak disebut atau disebut keliru | Keunggulan disebut namun tertukar dengan atribut umum | Keunggulan utama tersampaikan meski kurang tajam | Keunggulan utama tersampaikan jelas sesuai profil merek |
| Kepatuhan batasan | Melanggar lebih dari satu batasan penulisan | Melanggar satu batasan penulisan | Tidak melanggar namun mendekati batas pada satu bagian | Seluruh batasan penulisan dipatuhi |
| Ajakan bertindak | Tidak ada ajakan bertindak atau tidak relevan | Ada namun bentuknya tidak sesuai profil merek | Sesuai namun penempatannya kurang tepat | Bentuk dan penempatan sesuai profil merek |

Skor total setiap naskah dikelompokkan ke dalam empat kategori, yaitu 17 sampai 20 sangat konsisten, 13 sampai 16 konsisten, 9 sampai 12 cukup konsisten, dan 5 sampai 8 tidak konsisten. Batas kategori tersebut bersifat usulan dan perlu ditinjau bersama dosen pembimbing sebelum penilaian dimulai.

[CATATAN UNTUK PENULIS: dimensi matriks diturunkan dari struktur profil merek pada sistem, bukan dari pustaka. Setelah sub-bab 2.2.4 memperoleh definisi baku *brand voice*, tinjau kembali apakah kelima dimensi ini sudah mewakili konsep tersebut. Validitas isi matriks sebaiknya ditelaah dosen pembimbing sebelum dipakai.]

### 3.2.5. Rancangan Pengujian

Pengujian konsistensi *brand voice* dirancang untuk menekan keberpihakan penilai. Peneliti merupakan bagian dari instansi yang diteliti, sehingga rancangan berikut ditetapkan sebagai pengaman:

a. Penilaian dilakukan secara buta, yaitu penilai tidak mengetahui naskah mana yang dihasilkan dengan konteks merek dan mana yang tanpa konteks merek;
b. Urutan penyajian sampel diacak sehingga tidak membentuk pola yang dapat ditebak;
c. Penilaian dilakukan oleh sekurang-kurangnya tiga penilai secara mandiri tanpa berdiskusi satu sama lain;
d. Kesepakatan antar-penilai dihitung dan dilaporkan sebagai bagian dari hasil, bukan disembunyikan;
e. Peneliti tidak bertindak sebagai penilai.

Pengujian fungsional sistem dilakukan menggunakan metode *black box* untuk memastikan setiap kebutuhan fungsional pada Tabel 3.1 berjalan sesuai rancangan.

### 3.2.6. Metode Analisis Data

Data waktu produksi konten dianalisis menggunakan statistik deskriptif berupa nilai terendah, nilai tertinggi, median, dan rentang. Nilai median dan rentang dipilih sebagai ukuran utama karena data pada proses lama berupa estimasi retrospektif dengan sebaran yang lebar, sehingga rata-rata aritmetik mudah terdistorsi oleh kasus ekstrem. Pembandingan antara proses lama dan proses baru dilakukan secara deskriptif dan tidak menggunakan uji statistik parametrik, karena syarat pengukuran yang setara pada kedua kelompok tidak terpenuhi. Selain durasi, penyempitan rentang durasi turut dilaporkan sebagai indikator meningkatnya keterdugaan proses. Data skor rubrik dianalisis menggunakan statistik deskriptif per dimensi, kemudian dibandingkan antara naskah yang dihasilkan dengan konteks merek dan tanpa konteks merek. Kesepakatan antar-penilai dihitung menggunakan koefisien kesepakatan yang sesuai dengan jumlah penilai dan skala penilaian.

Perlu ditegaskan bahwa perbandingan waktu dilakukan antara proses lama secara keseluruhan dan proses baru secara keseluruhan. Penelitian ini tidak mengklaim bahwa penurunan waktu semata-mata disebabkan arsitektur *multi-agent*, karena antarmuka terpusat diterapkan bersamaan dengan arsitektur tersebut. Keterbatasan ini telah dinyatakan pada sub-bab 1.4.

## 3.3 Metode Pengembangan Sistem

Sistem dikembangkan menggunakan metode *Rapid Application Development* sebagaimana diuraikan pada sub-bab 2.2.7. Metode ini dipilih karena sifat pengembangan yang berlangsung bersifat berulang, ukuran tim kecil, dan pengguna terlibat langsung pada setiap tahapan. Tahapan metode beserta keluarannya disajikan pada Gambar 3.5 dan diuraikan sebagai berikut.

### 3.3.1. Requirements Planning

Pada fase ini ditetapkan kebutuhan dan ruang lingkup sistem bersama pemilik proses. Kegiatan yang dilakukan meliputi observasi proses berjalan, wawancara dengan admin, dan penyusunan dokumen acuan. Keluaran fase ini berupa dokumen spesifikasi kebutuhan, arsitektur informasi, sistem desain, dan alur pengguna, yang seluruhnya diselesaikan sebelum penulisan kode dimulai.

### 3.3.2. User Design

Pada fase ini rancangan disusun bersama pengguna secara berulang. Kegiatan yang dilakukan meliputi penyusunan kerangka aplikasi, perancangan tata letak dan navigasi, serta perancangan struktur basis data. Rancangan ditinjau oleh pengguna dan diperbaiki sebelum dilanjutkan. Keluaran fase ini berupa rancangan antarmuka, rancangan basis data, dan struktur modul layanan.

### 3.3.3. Construction

Pada fase ini sistem dibangun mengikuti rancangan yang telah disepakati. Pembangunan dilakukan bertahap per bagian fungsi, yaitu autentikasi, manajemen pengguna, profil merek dan subjek, modul produksi konten, modul iklan, serta pencatatan dan proses gabungan. Setiap bagian diuji begitu selesai, dan hasil pengujian dipakai untuk memperbaiki bagian tersebut sebelum bagian berikutnya dikerjakan. Pada fase inilah penyempurnaan konteks merek dilakukan setelah keluaran sistem dinilai masih terlalu umum.

### 3.3.4. Cutover

Pada fase ini sistem dialihkan ke lingkungan operasional. Kegiatan yang dilakukan meliputi penempatan seluruh layanan dalam wadah, pemasangan pada peladen, penyiapan akun awal, dan pengujian menyeluruh pada lingkungan sebenarnya. Keluaran fase ini berupa sistem yang dapat diakses dan digunakan tim.

## 3.4 Jadwal Penelitian

Jadwal penelitian disusun mulai dari persiapan sampai penulisan laporan, terhitung sejak September 2026 sampai Januari 2027, sebagaimana disajikan pada Tabel 3.3. Tanda silang menunjukkan bulan pelaksanaan setiap kegiatan.

| Kegiatan | Sep 2026 | Okt 2026 | Nov 2026 | Des 2026 | Jan 2027 |
| --- | --- | --- | --- | --- | --- |
| Studi literatur dan penyusunan proposal | X | X | | | |
| Pengumpulan data dan wawancara | | X | X | | |
| Analisis kebutuhan dan perancangan | | | X | | |
| Implementasi dan penyempurnaan sistem | | | X | X | |
| Pengumpulan materi dan penilaian rubrik | | | | X | |
| Pengukuran waktu produksi konten | | | | X | |
| Analisis hasil dan penyusunan laporan | | | | X | X |
