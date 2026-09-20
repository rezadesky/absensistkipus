
PRODUCT REQUIREMENTS DOCUMENT (PRD)
Sistem Informasi Absensi Fungsional
STKIP Usman Safri Kutacane
Atribut
 | Detail
 | 
Nama Produk
 | SiAbsen – Sistem Informasi Absensi Fungsional
 | 
Institusi
 | STKIP Usman Safri Kutacane
 | 
Versi Dokumen
 | 1.0.0
 | 
Tanggal
 | 20 September 2026
 | 
Status
 | Draft
 | 
Dibuat oleh
 | Tim Pengembang
 | 

1. Pendahuluan
1.1 Latar Belakang
STKIP Usman Safri Kutacane memerlukan sistem pencatatan kehadiran (absensi) yang modern, akurat, dan dapat diakses secara digital oleh seluruh civitas akademika. Sistem absensi manual yang saat ini digunakan rentan terhadap kesalahan pencatatan, manipulasi data, dan kesulitan dalam pembuatan laporan rekapitulasi. Oleh karena itu, diperlukan Sistem Informasi Absensi Fungsional berbasis web yang terintegrasi dan dapat digunakan oleh tiga kelompok pengguna utama.
1.2 Tujuan Produk
Menyediakan sistem absensi digital yang akurat dan real-time untuk Dosen dan Tenaga Kependidikan (Tendik).
Memudahkan Admin dalam mengelola data kehadiran, jadwal, dan rekap laporan.
Memberikan akses laporan dan monitoring kehadiran bagi Pimpinan untuk pengambilan keputusan.
Mengurangi potensi kecurangan absensi melalui validasi berbasis lokasi dan waktu.
Menghasilkan laporan absensi otomatis yang dapat diunduh untuk keperluan administrasi.

1.3 Ruang Lingkup
Sistem ini mencakup:
Absensi kehadiran harian Dosen dan Tendik (masuk &amp; pulang).
Manajemen izin dan cuti.
Rekapitulasi laporan absensi harian, mingguan, dan bulanan.
Dashboard monitoring kehadiran untuk Pimpinan.
Notifikasi otomatis untuk keterlambatan atau ketidakhadiran.

2. Stakeholder &amp; Pengguna
2.1 Daftar Stakeholder
No
 | Stakeholder
 | Peran
 | Kepentingan
 | 
1
 | Dosen &amp; Tendik
 | Pengguna akhir
 | Mencatat kehadiran harian, mengajukan izin/cuti
 | 
2
 | Admin
 | Pengelola sistem
 | Mengelola data master, rekap absensi, laporan
 | 
3
 | Pimpinan
 | Pemantau &amp; pengambil keputusan
 | Melihat laporan &amp; statistik kehadiran institusi
 | 
4
 | Tim IT
 | Pengelola teknis
 | Pemeliharaan dan pengembangan sistem
 | 

3. Kebutuhan Fungsional per Role
3.1 Role: Dosen &amp; Tendik
Dosen dan Tendik adalah pengguna operasional yang melakukan absensi harian secara mandiri.
3.1.1 Autentikasi &amp; Profil
Login menggunakan NIP/NIK dan password.
Mengedit profil pribadi (nama, foto, nomor HP, email).
Mengganti password secara mandiri.
Logout dari sistem.
3.1.2 Absensi Harian
Melakukan check-in (absen masuk) sesuai jadwal kerja.
Melakukan check-out (absen pulang).
Sistem mencatat waktu, tanggal, dan status (Tepat Waktu / Terlambat / Tidak Hadir).
Validasi lokasi menggunakan GPS (koordinat kampus) saat check-in/check-out.
Upload foto selfie sebagai bukti kehadiran (opsional/konfigurasi admin).
3.1.3 Permohonan Izin &amp; Cuti
Mengajukan permohonan izin (sakit, keperluan pribadi, dinas luar).
Mengajukan permohonan cuti tahunan.
Melampirkan dokumen pendukung (surat keterangan dokter, dll).
Melihat status permohonan (Menunggu / Disetujui / Ditolak).
Menerima notifikasi hasil permohonan izin/cuti.
3.1.4 Riwayat &amp; Laporan Pribadi
Melihat riwayat absensi pribadi (harian, mingguan, bulanan).
Melihat rekap kehadiran: jumlah hadir, terlambat, izin, cuti, alfa.
Mengunduh rekap absensi pribadi dalam format PDF atau Excel.

3.2 Role: Admin
Admin adalah pengelola sistem yang bertanggung jawab atas data master dan operasional absensi seluruh pegawai.
3.2.1 Manajemen Pengguna
Menambah, mengedit, menonaktifkan, dan menghapus akun Dosen/Tendik.
Mengatur role dan hak akses pengguna.
Reset password pengguna.
Import data pegawai dari file Excel.
3.2.2 Manajemen Jadwal Kerja
Membuat dan mengedit jadwal kerja (shift pagi, shift sore, dll).
Mengatur jam masuk dan jam pulang per jadwal.
Menugaskan jadwal kerja ke individu atau kelompok pegawai.
Mengatur hari libur nasional dan cuti bersama.
3.2.3 Manajemen Absensi
Melihat seluruh data absensi harian semua pegawai.
Mengedit atau mengoreksi data absensi (dengan keterangan alasan).
Memproses dan menyetujui/menolak permohonan izin dan cuti.
Menambahkan absensi manual untuk pegawai yang mengalami kendala teknis.
Mengatur toleransi keterlambatan (misal: grace period 15 menit).
3.2.4 Manajemen Lokasi (Geofencing)
Mengatur titik koordinat dan radius area kampus untuk validasi absensi.
Menambahkan lokasi dinas luar yang diizinkan.
3.2.5 Laporan &amp; Rekap
Menghasilkan laporan rekap absensi per individu, per unit/prodi, dan keseluruhan.
Filter laporan berdasarkan: periode, unit kerja, status kehadiran.
Mengunduh laporan dalam format PDF dan Excel.
Mencetak daftar hadir untuk keperluan fisik.
Melihat statistik kehadiran (grafik tren kehadiran bulanan).
3.2.6 Notifikasi &amp; Pengumuman
Mengirim notifikasi pengingat absensi kepada seluruh pengguna.
Mengatur notifikasi otomatis untuk pegawai yang belum absen melewati jam tertentu.

3.3 Role: Pimpinan
Pimpinan (Rektor, Wakil Rektor, Ketua Prodi, Kepala Unit) memiliki akses baca (read-only) terhadap seluruh laporan kehadiran untuk kepentingan monitoring dan pengambilan keputusan.
3.3.1 Dashboard Monitoring
Melihat ringkasan kehadiran hari ini: jumlah hadir, terlambat, izin, tidak hadir.
Melihat grafik tren kehadiran mingguan dan bulanan.
Melihat persentase kehadiran per unit kerja / prodi.
Widget notifikasi: pegawai dengan tingkat alfa tertinggi.
3.3.2 Laporan Kehadiran
Melihat laporan rekap kehadiran seluruh pegawai atau per unit.
Filter laporan berdasarkan: periode, unit kerja, individu.
Melihat detail kehadiran individu tertentu.
Mengunduh laporan rekap dalam format PDF dan Excel untuk keperluan rapat/evaluasi.
3.3.3 Statistik &amp; Analitik
Melihat statistik kehadiran: rata-rata kehadiran, rata-rata keterlambatan.
Perbandingan kehadiran antar unit kerja / prodi.
Grafik pegawai dengan kehadiran terbaik dan terendah.
Laporan trend bulanan sepanjang tahun akademik.

4. Kebutuhan Non-Fungsional
Kategori
 | Requirement
 | Detail
 | 
Performa
 | Response time
 | Halaman utama &amp; dashboard &lt; 2 detik
 | 
Performa
 | Concurrent users
 | Mendukung minimal 200 pengguna bersamaan
 | 
Keamanan
 | Autentikasi
 | JWT Token + session management
 | 
Keamanan
 | Enkripsi
 | Password di-hash dengan bcrypt, HTTPS wajib
 | 
Keamanan
 | Role-based Access
 | Setiap endpoint diproteksi sesuai role
 | 
Ketersediaan
 | Uptime
 | Minimal 99% (kecuali maintenance terjadwal)
 | 
Kompatibilitas
 | Browser
 | Chrome, Firefox, Edge, Safari (versi 2 tahun terakhir)
 | 
Kompatibilitas
 | Mobile
 | Responsive design untuk smartphone Android &amp; iOS
 | 
Data
 | Backup
 | Backup otomatis harian, retensi 90 hari
 | 
Data
 | Audit log
 | Setiap perubahan data tercatat dengan timestamp &amp; user
 | 

6. Alur Utama (User Flow)
6.1 Alur Absensi Dosen/Tendik
Pengguna membuka aplikasi → Login dengan NIP &amp; password.
Sistem memverifikasi identitas dan sesi login.
Pengguna menekan tombol "Absen Masuk".
Sistem memvalidasi waktu (jam kerja) dan lokasi GPS (dalam radius kampus).
Jika valid → absensi berhasil disimpan dengan status (Tepat Waktu / Terlambat).
Pengguna dapat melihat konfirmasi kehadiran di dashboard pribadi.
Saat jam pulang → pengguna menekan "Absen Pulang" dengan proses validasi serupa.

6.2 Alur Permohonan Izin
Pengguna memilih menu "Permohonan Izin/Cuti".
Mengisi formulir: jenis izin, tanggal, keterangan, dan lampiran dokumen.
Permohonan dikirim → status berubah menjadi "Menunggu Persetujuan".
Admin menerima notifikasi permohonan baru.
Admin meninjau dan menyetujui/menolak permohonan (dengan catatan).
Pengguna menerima notifikasi hasil permohonan.

6.3 Alur Pembuatan Laporan (Admin)
Admin membuka menu Laporan.
Memilih filter: periode, unit kerja, atau individu.
Sistem menghasilkan rekap kehadiran sesuai filter.
Admin dapat melihat di layar atau mengunduh dalam format PDF/Excel.

7. Struktur Menu Aplikasi
7.1 Menu Dosen &amp; Tendik
Dashboard Pribadi (ringkasan kehadiran bulan ini)
Absen Masuk / Absen Pulang
Riwayat Absensi (filter tanggal)
Permohonan Izin &amp; Cuti
Rekap Kehadiran (unduh PDF/Excel)
Profil &amp; Pengaturan Akun

7.2 Menu Admin
Dashboard Admin (statistik harian keseluruhan)
Manajemen Pengguna (tambah/edit/hapus/import Excel)
Manajemen Jadwal Kerja
Data Absensi (koreksi &amp; persetujuan izin)
Manajemen Lokasi (geofencing)
Laporan &amp; Rekap (filter &amp; unduh)
Notifikasi &amp; Pengumuman
Pengaturan Sistem

7.3 Menu Pimpinan
Dashboard Monitoring (ringkasan institusi)
Laporan Kehadiran (per individu / unit / periode)
Statistik &amp; Analitik (grafik tren, perbandingan unit)
Unduh Laporan (PDF/Excel)

8. Milestone &amp; Timeline Pengembangan
Fase
 | Kegiatan
 | Durasi
 | Output
 | 
Fase 1
 | Analisis kebutuhan &amp; desain sistem (ERD, wireframe, UI/UX)
 | 2 minggu
 | Dokumen desain, wireframe
 | 
Fase 2
 | Setup infrastruktur &amp; pengembangan backend (API, database, autentikasi)
 | 3 minggu
 | API siap pakai
 | 
Fase 3
 | Pengembangan frontend – Role Dosen &amp; Tendik
 | 2 minggu
 | Fitur absensi &amp; izin
 | 
Fase 4
 | Pengembangan frontend – Role Admin
 | 2 minggu
 | Fitur manajemen &amp; laporan
 | 
Fase 5
 | Pengembangan frontend – Role Pimpinan + Dashboard
 | 1 minggu
 | Dashboard monitoring
 | 
Fase 6
 | Integrasi GPS/Geofencing &amp; notifikasi
 | 1 minggu
 | Fitur validasi lokasi
 | 
Fase 7
 | Testing (unit test, UAT bersama pengguna), perbaikan bug
 | 2 minggu
 | Aplikasi terverifikasi
 | 
Fase 8
 | Pelatihan pengguna, deployment, dan go-live
 | 1 minggu
 | Sistem live &amp; dokumentasi
 | 

9. Kriteria Penerimaan (Acceptance Criteria)
Dosen/Tendik dapat melakukan absen masuk dan pulang dengan validasi GPS berhasil dalam &lt; 5 detik.
Permohonan izin/cuti dapat diajukan dan diproses oleh Admin dengan notifikasi diterima pengguna.
Admin dapat menghasilkan laporan rekap absensi bulanan dalam format PDF dan Excel.
Pimpinan dapat mengakses dashboard dengan data real-time tanpa hak edit data.
Sistem menolak akses absensi di luar radius geofencing yang telah dikonfigurasi.
Seluruh data pengguna dan absensi tersimpan dengan aman dan dapat dipulihkan dari backup.
Tampilan responsif dan berfungsi normal di perangkat mobile (Android &amp; iOS).

10. Risiko &amp; Mitigasi
Risiko
 | Dampak
 | Kemungkinan
 | Mitigasi
 | 
GPS tidak akurat di dalam gedung
 | Absensi ditolak meski pengguna di kampus
 | Tinggi
 | Tambahkan opsi absensi via WiFi SSID kampus atau kode QR
 | 
Pengguna lupa absen
 | Data kehadiran tidak akurat
 | Tinggi
 | Notifikasi otomatis via email/WA jika belum absen hingga jam tertentu
 | 
Server down saat jam absensi
 | Absensi massal gagal
 | Sedang
 | Mode offline dengan sinkronisasi saat koneksi kembali tersedia
 | 
Resistensi pengguna terhadap sistem baru
 | Adopsi rendah
 | Sedang
 | Pelatihan intensif, antarmuka yang sederhana, pendampingan awal
 | 
Data privasi pegawai bocor
 | Masalah hukum &amp; kepercayaan
 | Rendah
 | Enkripsi data, audit log, dan pembatasan akses ketat
 | 

11. Glosarium
Istilah
 | Definisi
 | 
Absensi Fungsional
 | Sistem pencatatan kehadiran pegawai berdasarkan fungsi/jabatan
 | 
Geofencing
 | Batasan virtual berbasis GPS untuk menentukan area yang diizinkan melakukan absensi
 | 
Check-in / Check-out
 | Proses absen masuk (awal kerja) dan absen pulang (akhir kerja)
 | 
Tendik
 | Tenaga Kependidikan – pegawai non-dosen yang mendukung operasional kampus
 | 
NIP/NIK
 | Nomor Induk Pegawai / Nomor Induk Kependudukan sebagai identitas unik pengguna
 | 
UAT
 | User Acceptance Testing – pengujian sistem bersama pengguna akhir sebelum go-live
 | 
Rekap Absensi
 | Ringkasan data kehadiran dalam periode tertentu (harian/bulanan)
 | 
Role
 | Peran pengguna dalam sistem yang menentukan hak akses fitur
 | 

— Akhir Dokumen PRD —
