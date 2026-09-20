<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\PengaturanAbsensi;
use App\Models\Presensi;
use App\Models\PengajuanIzin;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // 1. Roles
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $rolePimpinan = Role::firstOrCreate(['name' => 'pimpinan']);
        $roleDosenTendik = Role::firstOrCreate(['name' => 'dosen_tendik']);

        // 2. Settings / Pengaturan Absensi
        PengaturanAbsensi::firstOrCreate(
            ['id' => 1],
            [
                'nama_instansi' => 'STKIP Usman Safri Kutacane',
                'latitude' => 3.48625000,
                'longitude' => 97.80916700,
                'radius_meter' => 200, // 200 meter geofence
                'jam_masuk' => '08:00:00',
                'toleransi_keterlambatan_menit' => 15,
                'jam_pulang' => '16:00:00',
                'wajib_foto' => true,
            ]
        );

        // 3. Admin Account
        $admin = User::updateOrCreate(
            ['email' => 'admin@stkip-us.ac.id'],
            [
                'nip' => '198001012005011001',
                'nik' => '1102010101800001',
                'name' => 'Administrator SiAbsen',
                'role_type' => 'admin',
                'jabatan' => 'Kepala Biro Administrasi & IT',
                'unit_kerja' => 'Biro Administrasi Umum & Kepegawaian',
                'jenis_kelamin' => 'L',
                'no_hp' => '081234567890',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $admin->assignRole($roleAdmin);

        // 4. Akun Personal Reza Saputra Desky (Admin)
        $reza = User::updateOrCreate(
            ['email' => 'rezasaputradesky@gmail.com'],
            [
                'nip' => '199501012020011001',
                'nik' => '1102010101950001',
                'name' => 'Reza Saputra Desky',
                'role_type' => 'admin',
                'jabatan' => 'Administrator Sistem & Pengembang',
                'unit_kerja' => 'Biro Sistem Informasi',
                'jenis_kelamin' => 'L',
                'no_hp' => '081234567899',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $reza->assignRole($roleAdmin);

        // 5. Pimpinan Account
        $pimpinan = User::updateOrCreate(
            ['email' => 'pimpinan@stkip-us.ac.id'],
            [
                'nip' => '197505122000031002',
                'nik' => '1102011205750002',
                'name' => 'Dr. H. Usman Safri, M.Pd.',
                'role_type' => 'pimpinan',
                'jabatan' => 'Ketua STKIP Usman Safri',
                'unit_kerja' => 'Pimpinan Institusi',
                'jenis_kelamin' => 'L',
                'no_hp' => '081234567891',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $pimpinan->assignRole($rolePimpinan);

        // 6. Dosen Account
        $dosen = User::updateOrCreate(
            ['email' => 'dosen@stkip-us.ac.id'],
            [
                'nip' => '198803152015041003',
                'nik' => '1102011503880003',
                'name' => 'Ahmad Fauzi, M.Kom.',
                'role_type' => 'dosen_tendik',
                'jabatan' => 'Dosen Fungsional',
                'unit_kerja' => 'Program Studi Pendidikan Komputer',
                'jenis_kelamin' => 'L',
                'no_hp' => '081234567892',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $dosen->assignRole($roleDosenTendik);

        // 7. Tendik / Pegawai Account
        $pegawai = User::updateOrCreate(
            ['email' => 'pegawai@stkip-us.ac.id'],
            [
                'nip' => '199207202018012004',
                'nik' => '1102012007920004',
                'name' => 'Siti Aminah, S.Pd.',
                'role_type' => 'dosen_tendik',
                'jabatan' => 'Staf Administrasi Akademik',
                'unit_kerja' => 'Bagian Akademik & Kemahasiswaan',
                'jenis_kelamin' => 'P',
                'no_hp' => '081234567893',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $pegawai->assignRole($roleDosenTendik);
    }
}
