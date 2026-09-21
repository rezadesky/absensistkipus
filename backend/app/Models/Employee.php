<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_number',
        'employee_type',
        'position',
        'department',
        'phone',
    ];

    /**
     * Relationship: Employee belongs to User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
