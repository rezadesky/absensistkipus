<?php

namespace Database\Seeders;

use App\Models\WorkDay;
use Illuminate\Database\Seeder;

class WorkDaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $days = [
            ['day' => 'senin', 'is_active' => true],
            ['day' => 'selasa', 'is_active' => true],
            ['day' => 'rabu', 'is_active' => true],
            ['day' => 'kamis', 'is_active' => true],
            ['day' => 'jumat', 'is_active' => true],
            ['day' => 'sabtu', 'is_active' => false],
            ['day' => 'minggu', 'is_active' => false],
        ];

        foreach ($days as $dayData) {
            WorkDay::updateOrCreate(['day' => $dayData['day']], $dayData);
        }
    }
}
