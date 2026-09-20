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
        PengaturanAbsensi::create([
            'nama_instansi' => 'STKIP Usman Safri Kutacane',
            'latitude' => 3.48625000,
            'longitude' => 97.80916700,
            'radius_meter' => 200, // 200 meter geofence
            'jam_masuk' => '08:00:00',
            'toleransi_keterlambatan_menit' => 15,
            'jam_pulang' => '16:00:00',
            'wajib_foto' => true,
        ]);

        // 3. Admin Account
        $admin = User::create([
            'nip' => '198001012005011001',
            'nik' => '1102010101800001',
            'name' => 'Administrator SiAbsen',
            'email' => 'admin@stkipusmansafri.ac.id',
            'role_type' => 'admin',
            'jabatan' => 'Kepala Biro Administrasi & IT',
            'unit_kerja' => 'Biro Administrasi Umum & Kepegawaian',
            'jenis_kelamin' => 'L',
            'no_hp' => '081234567890',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $admin->assignRole($roleAdmin);

        // 4. Pimpinan Account
        $pimpinan = User::create([
            'nip' => '197505122000031002',
            'nik' => '1102011205750002',
            'name' => 'Dr. H. Usman Safri, M.Pd.',
            'email' => 'pimpinan@stkipusmansafri.ac.id',
            'role_type' => 'pimpinan',
            'jabatan' => 'Ketua STKIP Usman Safri',
            'unit_kerja' => 'Pimpinan Institusi',
            'jenis_kelamin' => 'L',
            'no_hp' => '081234567891',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $pimpinan->assignRole($rolePimpinan);
    }
}
