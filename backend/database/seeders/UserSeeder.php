<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $defaultPassword = Hash::make('stkipus2026');

        // 1. Admin
        User::updateOrCreate(
            ['email' => 'admin@stkip-us.ac.id'],
            [
                'name' => 'Administrator Utama',
                'password' => $defaultPassword,
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 2. Dosen Utama
        $dosen = User::updateOrCreate(
            ['email' => 'dosen@stkip-us.ac.id'],
            [
                'name' => 'Dr. Ahmad Fauzi, M.Pd.',
                'password' => $defaultPassword,
                'role' => 'dosen',
                'status' => 'active',
            ]
        );
        Employee::updateOrCreate(
            ['user_id' => $dosen->id],
            [
                'employee_number' => '198203152008121001',
                'employee_type' => 'dosen',
                'position' => 'Lektor Kepala',
                'department' => 'Dosen',
                'phone' => '081234567890',
            ]
        );

        // 3. Tendik Utama
        $tendik = User::updateOrCreate(
            ['email' => 'tendik@stkip-us.ac.id'],
            [
                'name' => 'Siti Rahmah, S.Pd.',
                'password' => $defaultPassword,
                'role' => 'tendik',
                'status' => 'active',
            ]
        );
        Employee::updateOrCreate(
            ['user_id' => $tendik->id],
            [
                'employee_number' => '198911042015042002',
                'employee_type' => 'tendik',
                'position' => 'Staf Administrasi Akademik',
                'department' => 'Tendik',
                'phone' => '081234567892',
            ]
        );

        // 4. Pimpinan
        $pimpinan = User::updateOrCreate(
            ['email' => 'pimpinan@stkip-us.ac.id'],
            [
                'name' => 'Prof. Dr. Usman Safri, M.Ed.',
                'password' => $defaultPassword,
                'role' => 'pimpinan',
                'status' => 'active',
            ]
        );
        Employee::updateOrCreate(
            ['user_id' => $pimpinan->id],
            [
                'employee_number' => '196001011988031001',
                'employee_type' => 'pimpinan',
                'position' => 'Ketua STKIP',
                'department' => 'Pimpinan',
                'phone' => '081234567894',
            ]
        );
    }
}
