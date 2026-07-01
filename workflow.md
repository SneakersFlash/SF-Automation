WORKFLOW (Alur Kerja)

Fase 0: Validasi SOT
Input: Chat User / Scan Folder
Scan file sistem untuk 4 dokumen SOT.
Jika dokumen lengkap: Lanjut ke Fase 1.
Jika dokumen tidak lengkap: Ajukan pertanyaan strategis kepada user untuk mendapatkan data yang hilang.

Fase 1: Project Scaffolding (Arsitektur)
Reference: @sofware-requirement-spesification.md 
Generate struktur folder utama.
Buat file konfigurasi (linting, environment, dependencies).
Buat file entry point aplikasi.
Constraint: Jangan buat UI atau logika bisnis di fase ini.

Fase 2: Layout & Navigation (Shell)
Reference: @information-architecture.md 
Implementasi kerangka utama (Navbar, Sidebar, Footer).
Setup sistem routing berdasarkan IA.
Buat halaman kosong (skeleton) untuk semua rute yang terdaftar.
Constraint: Gunakan hanya warna/komponen dasar dari Design System.

Fase 3: Detailed Implementation (Functional)
Reference: @user-flow.md  & @design-system.md
Implementasi komponen UI mendetail di setiap halaman.
Hubungkan logika bisnis sesuai alur user flow.
Pastikan semua aksi (button, form) memiliki feedback sesuai dokumentasi.