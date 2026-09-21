<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['izin', 'sakit', 'dinas', 'keperluan_keluarga', 'lainnya']),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'reason' => $this->faker->sentence(),
            'attachment' => null,
            'status' => 'menunggu',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_note' => null,
        ];
    }
}
